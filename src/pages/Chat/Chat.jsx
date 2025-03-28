import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ThoughtInput from "../../components/ChatComponent/ThoughtInput";
import ChatMessage from "../../components/ChatComponent/ChatMessage";
import UserChatMessage from "../../components/ChatComponent/UserChatMessage";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Chat = () => {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [userName, setUserName] = useState("Promise"); // Default username
  const [title, setTitle] = useState("Learnify AI"); // Default username
  const [userInitials, setUserInitials] = useState("I"); // Default initials
  const [userPhoto, setUserPhoto] = useState(null); // User profile photo

  useEffect(() => {
    const auth = getAuth();
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
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
        if (!userId || !id) return;

        const chatDoc = doc(db, "users", userId, "chatSessions", id);
        const chatSnap = await getDoc(chatDoc);

        if (chatSnap.exists()) {
            setMessages(chatSnap.data().messages || []);
            setTitle(chatSnap.data().name || "Learnify AI");
        } else if (state?.initialMessage) {
            setTypingMessageId(2);

            let initialMessages = [
                { 
                    id: 1, 
                    text: "Summarize this document", 
                    user: "User 2", 
                    file_uri: state.file_uris ?? [], // ✅ Ensure it's not undefined
                    file_type: state.type ?? "unknown", // ✅ Provide a default value
                },
                { 
                    id: 2, 
                    text: state.initialMessage, 
                    user: "User 1" 
                }
            ];

            console.log(chatDoc);

            await setDoc(chatDoc, { 
                messages: initialMessages, 
                updatedAt: new Date().toISOString(), 
                name: state?.title ?? "Learnify AI" // ✅ Ensure title is not undefined
            });

            setTitle(state?.title || "Learnify AI");
            setMessages(initialMessages);
        }
    };

    fetchMessages();
}, [userId, id, state.initialMessage, state.isSummary, state.title, state.file_uris, state.type]);

  const addMessage = async (payload, user) => {
    console.log(payload.message);
    const text = payload.message;
    if (!payload.message.trim()) return;

    const userTimestamp = new Date().toLocaleTimeString(); // User message timestamp
    const newMessage = { id: messages.length + 1, text, user, timestamp: userTimestamp };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const chatDoc = doc(db, "users", userId, "chatSessions", id);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: id,
          file_type: payload.file_type,
          file_uris: payload.file_uris,
          message: text,
          userTimestamp: userTimestamp, // Send user's timestamp to backend
          updateTimestamp: new Date().toISOString(), // Send an update timestamp
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const AITimestamp = new Date().toLocaleTimeString(); // AI response timestamp
      const botMessage = { id: newMessage.id + 1, text: data.response, user: "Learnify AI", timestamp: AITimestamp, msg_type: "text", file_uri: null };

      setTypingMessageId(botMessage.id);
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      await setDoc(chatDoc, { messages: [...messages, newMessage, botMessage], updatedAt: new Date().toISOString() }, { merge: true });
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
      {/* Chat Messages (Scrollable Area) */}
      <div className="h-[80vh] overflow-y-auto p-4 space-y-4 lg:pt-[6rem] lg:pl-40 lg:pr-48 md:px-28 pt-[4rem] px-6 pb-24">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.user === "User 2" ? "justify-end" : "justify-start"}`}>
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
              <ChatMessage timestamp={msg.timestamp} message={msg.text} current={msg.id === typingMessageId} />
            )}
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="lg:pl-40 lg:pr-48 md:px-28 px-0 w-full absolute bottom-0">
        <ThoughtInput onSend={(message) => addMessage(message, "User 2")} />
      </div>
    </>
  );
};

export default Chat;