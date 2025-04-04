import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ThoughtInput from "../../components/ChatComponent/ThoughtInput";
import ChatMessage from "../../components/ChatComponent/ChatMessage";
import UserChatMessage from "../../components/ChatComponent/UserChatMessage";
import { initFirebase } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Chat = () => {
  const { id } = useParams();
  const location = useLocation();
  const [db, setDb] = useState(null);
  const state = location.state || {};
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [userName, setUserName] = useState("Promise"); // Default username
  const [title, setTitle] = useState("Learnify AI"); // Default username
  const [userInitials, setUserInitials] = useState("I"); // Default initials
  const [userPhoto, setUserPhoto] = useState(null); // User profile photo
  const [userScrolled, setUserScrolled] = useState(false);
  const navigate = useNavigate();
  const lastScrollTop = useRef(0)
  const containerRef = useRef(null)
  const [ messageLoading, setMessageLoading ] = useState(false)

  useEffect(() => {
    const container = containerRef.current;
    console.log("We all started together")
    if (!container) return;

    const handleScroll = () => {

      if (!container) return;
    
      if (container.scrollTop < lastScrollTop.current) {
        console.log("stop here please I beg you")
        setUserScrolled(true); 
        container.removeEventListener("scroll", handleScroll)
        return
      } else {
        console.log("I will never stop don't beg me")

        setUserScrolled(false); // User scrolled down or stayed at bottom
      }
    
      lastScrollTop.current = container.scrollTop; // Update last scroll position
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const initializeFirebase = async () => {
      const { db } = await initFirebase();
      setDb(db);
    };
    initializeFirebase();
  }, []);
  useEffect(() => {
    const setUpAuth = async ()=> {
      const { auth } = await initFirebase();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          setUserName(user.displayName || "Anonymous"); // Use displayName from Firebase Auth
          setUserPhoto(user.photoURL || null); // Use photoURL from Firebase Auth if available
          
          // Generate initials from displayName if no photo is available
          if (user.displayName) {
            const initials = user.displayName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            setUserInitials(initials);
          }
        }
      });
      return () => unsubscribe(); // Cleanup subscription
    }
    setUpAuth()
  }, []);

  useEffect(() => {
    if (!db) return
    console.log("Here")
    console.log(messages)
    const fetchMessages = async () => {
        if (!userId || !id) return;

        const chatDoc = doc(db, "users", userId, "chatSessions", id);
        const chatSnap = await getDoc(chatDoc);

        if (chatSnap.exists()) {
            setMessages(chatSnap.data().messages || []);
            setTitle(chatSnap.data().name || "Learnify AI");
        } else if (state?.new === true) {
          addMessage(state.payload, "User 2", true)
            // setTypingMessageId(2);

            // let initialMessages = [
            //     { 
            //         id: 1, 
            //         text: "Summarize this document", 
            //         user: "User 2", 
            //         file_uri: state.file_uris ?? [], // ✅ Ensure it's not undefined
            //         file_type: state.type ?? "unknown", // ✅ Provide a default value
            //     },
            //     { 
            //         id: 2, 
            //         text: state.initialMessage, 
            //         user: "User 1" 
            //     }
            // ];

            // console.log(chatDoc);

            // await setDoc(chatDoc, { 
            //     messages: initialMessages, 
            //     updatedAt: new Date().toISOString(), 
            //     name: state?.title ?? "Learnify AI" // ✅ Ensure title is not undefined
            // });

            // setTitle(state?.title || "Learnify AI");
            // console.log("Python",initialMessages)
            // setMessages(initialMessages);
        } else {
          navigate("/chat")
        }
    };

    fetchMessages();
}, [userId, id, state.initialMessage, state.isSummary, state.title, state.file_uris, state.type]);

const addMessage = async (payload, user, isNew) => {
  console.log(payload.message);
  const text = payload.message;
  if (!payload.message.trim()) return;
  setMessageLoading(true);

  const userTimestamp = new Date().toLocaleTimeString(); // User message timestamp
  const newMessage = { id: messages.length + 1, text, user, timestamp: userTimestamp };
  const botMessage = {
    id: newMessage.id + 1,
    text: "",
    user: "Learnify AI",
    timestamp: null,
    msg_type: "text",
    file_uri: null,
};
  setTypingMessageId(newMessage.id + 1);

  setMessages((prevMessages) => [...prevMessages, newMessage, botMessage]);

  const chatDoc = doc(db, "users", userId, "chatSessions", id);

  try {
      // Fetch chat history from Firestore before sending
      const chatSnapshot = await getDoc(chatDoc);
      let chatHistory = [];
      if (chatSnapshot.exists()) {
          const chatData = chatSnapshot.data();
          chatHistory = chatData.messages || [];
      }

      const response = await fetch("https://learnifya1-d7a809b39e9d.herokuapp.com/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              user_id: userId,
              session_id: id,
              file_type: payload.file_type,
              file_uris: payload.file_uris,
              new: isNew,
              message: text,
              userTimestamp: userTimestamp, // Send user's timestamp to backend
              updateTimestamp: new Date().toISOString(), // Send an update timestamp
              chat_history: chatHistory, // Send fetched chat history to backend
          }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const AITimestamp = new Date().toLocaleTimeString(); // AI response timestamp
      

      setMessageLoading(false)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
            msg.id === botMessage.id
                ? { ...msg, text: data.response, timestamp: AITimestamp }
                : msg
        )
    );
    const savedBotMessage = {
      id: newMessage.id + 1,
      text: data.response,
      user: "Learnify AI",
      timestamp: AITimestamp,
      msg_type: "text",
      file_uri: null,
  };
      // Update Firestore with new chat messages
      
      if (data.title){
        await setDoc(chatDoc, { messages: [...chatHistory, newMessage, savedBotMessage], name: data.title, updatedAt: new Date().toISOString() }, { merge: true });
      }else {
        await setDoc(chatDoc, { messages: [...chatHistory, newMessage, savedBotMessage], updatedAt: new Date().toISOString() }, { merge: true });
      }
  } catch (error) {
      console.error("Error calling the chat API:", error);
  }
};



  useEffect(() => {
    document.title = title; 

    return () => {
      document.title = "Learnify AI"; 
    };
  }, [title]);

  return (
    <>
    <div
      ref={containerRef}
      className="flex h-full relative flex-col justify-start items-center w-screen lg:w-[calc(100vw-18rem)] overflow-y-scroll">
      <div className="w-[95%] sm:w-[74%] mx-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.user === "User 2" ? "justify-end" : "justify-start w-full"}`}>
            {msg.user === "User 2" ? (
              <UserChatMessage
              msgType={msg.file_type} 
              fileUri={msg.file_uri}
              username={userName}
              timestamp={msg.timestamp}
              message={msg.text}
              userPhoto={userPhoto}
              userInitials={userInitials}
            />
          ) : (
              <ChatMessage messageLoading={messageLoading} userScrolled={userScrolled} timestamp={msg.timestamp} message={msg.text} current={msg.id === typingMessageId} />
            )}
          </div>
        ))}
      </div>
    </div>
      <div className="w-[95%] sm:w-[75%] mx-auto sticky bottom-0 mt-auto">
        <ThoughtInput onSend={(message) => addMessage(message, "User 2", false)} />
      </div>
    </>

  );
};

export default Chat;