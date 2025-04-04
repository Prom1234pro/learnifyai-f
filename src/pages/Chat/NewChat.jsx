import { useState, useEffect } from "react";
// import document from "../../assets/document.svg";
// import image from "../../assets/image.svg";
import logo from "../../assets/logo.png";
import ThoughtInput from "../../components/ChatComponent/ThoughtInput";
// import UploadDocument from "../../components/ChatComponent/UploadDocument";
import { initFirebase } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";


const NewChat = () => {
  const [userId, setUserId] = useState(null);
  // const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  // const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [userName, setUserName] = useState("Anonymous");
  const navigate = useNavigate();

  useEffect(() => {
    const setUpAuth = async ()=> {
    const { auth } = await initFirebase();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || "Anonymous"); // Use displayName from Firebase Auth
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }
  setUpAuth()
  }, []);

   const addMessage = async (payload) => {
      console.log(payload.message);
      const text = payload.message;
      if (!payload.message.trim()) return;
      const timestamp = `${Date.now()}`

      navigate(`/chat/${timestamp}`, {
          state: { payload, new: true },
      });

      // const userTimestamp = new Date().toLocaleTimeString(); // User message timestamp
  
  
      // try {
      //   const timestamp = `${Date.now()}`
      //   const response = await fetch("https://learnifya1-d7a809b39e9d.herokuapp.com/chat", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       user_id: userId,
      //       session_id: timestamp,
      //       file_uris: payload.file_uris,
      //       new: true,
      //       message: text,
      //       userTimestamp: userTimestamp, // Send user's timestamp to backend
      //       updateTimestamp: new Date().toISOString(), // Send an update timestamp
      //     }),
      //   });
  
      //   if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  
      //   const data = await response.json();
      //   console.log(data)
       
      //   navigate(`/chat/${timestamp}`, {
      //     state: { initialMessage: data.response, isSummary: true, title: data.title, file_uris: data.file_uris },
      // });

      // } catch (error) {
      //   console.error("Error calling the chat API:", error);
      // }
  };
  
  return (
    <div className="flex h-full relative flex-col justify-start items-center gap-5  w-screen lg:w-[calc(100vw-18rem)]">
      <div className="sm:mb-0 pt-[5rem] px-2">
        {/* <div className="absolute top-2 right-0 -translate-x-8 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#632366] to-[#44798E] text-white text-sm font-normal">
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
        </div> */}
        <div className="flex flex-col w-full text-center">
          <div className="flex items-center justify-center w-full">
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Outer Circle */}
              <div className="absolute w-24 h-24 rounded-full bg-[#6326681A]"></div>

              {/* Inner Circle */}
              <div className="absolute w-[4.5rem] h-[4.5rem] rounded-full bg-[#61296933] flex items-center justify-center">
                {/* Logo Image */}
                <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
              </div>
            </div>
          </div>
          <h2 className="text-xl lg:text-2xl font-semibold text-[#282A2F] mt-4">
            Hi, <span className="bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent">{userName}</span>
          </h2>
          <h2 className="text-[#282A2F] mt-2 text-xl font-semibold lg:text-2xl">Curious about any topic?</h2>
          {/* <p className="text-[#696F79] mt-2">Choose the option that works best for you</p> */}
        </div>
      </div>
      <div className="w-[95%] sm:w-[75%] mx-auto sticky bottom-0 mt-auto">
        <ThoughtInput onSend={addMessage}/>
      </div>
    </div>
  );
};
  
  export default NewChat;