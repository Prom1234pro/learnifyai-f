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
  const [userInitials, setUserInitials] = useState("PR"); // Default initials
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
      } else if (state?.initialMessage) {
        setTypingMessageId(1);
        let initialMessages = state.isSummary
          ? [{ id: 1, text: state.initialMessage, user: "User 1" }]
          : [
              { id: 1, text: state.initialMessage, user: "User 2" },
              { id: 2, text: "Welcome to the chat", user: "User 1" },
            ];

        await setDoc(chatDoc, { messages: initialMessages, updatedAt: new Date().toISOString(), name: state?.name });
        setMessages(initialMessages);
      }
    };

    fetchMessages();
  }, [userId, id, state.initialMessage, state.isSummary, state.name]);

  const addMessage = async (payload, user) => {
    console.log(payload.text)
    const text = payload.text
    if (!payload.text.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessage = { id: messages.length + 1, text, user, timestamp };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const chatDoc = doc(db, "users", userId, "chatSessions", id);

    try {
      const historyLog = [...messages, { user, text }];
      const context = JSON.parse(localStorage.getItem(id) || "{}").text;
      console.log("context",context)

      const response = await fetch("https://learnifya1-d7a809b39e9d.herokuapp.com/chat-with-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          history_log: historyLog.map((msg) => ({ role: msg.user, text: msg.text })),
          topic: "",
          context: context,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const aitime = new Date().toLocaleTimeString();
      const botMessage = { id: newMessage.id + 1, text: data.response[0], user: "User 1", timestamp: aitime };

      setTypingMessageId(botMessage.id);
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      await setDoc(chatDoc, { messages: [...messages, newMessage, botMessage], updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error calling the chat API or updating Firestore:", error);
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-gradient-to-br from-[#ffffff] via-[#e7dbe9ac] to-[#A362A880] relative">
      <div className="absolute top-2 right-0 -translate-x-8 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#632366] to-[#44798E] text-white text-sm font-normal">
        <span className="mr-2">{userName}</span>
        {userPhoto? (
          <img
            src={userPhoto}
            alt="User Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <span className="w-6 h-6 p-4 flex items-center justify-center rounded-full bg-gradient-to-r from-[#632366] to-[#44798E] text-xs font-bold">
            {userInitials}
          </span>
        )}
      </div>

      {/* Chat Messages (Scrollable Area) */}
      <div className="flex-1 h-screen overflow-y-auto p-4 space-y-4 lg:pt-[6rem] lg:pl-40 lg:pr-48 md:px-28 pt-[4rem] px-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.user === "User 2" ? "justify-end" : "justify-start"}`}>
            {msg.user === "User 2" ? (
              <UserChatMessage
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
      <div className="lg:pl-40 lg:pr-48 md:px-28 px-6 w-full absolute bottom-0">
        <ThoughtInput onSend={(message) => addMessage(message, "User 2")} />
      </div>
    </div>
  );
};

export default Chat;