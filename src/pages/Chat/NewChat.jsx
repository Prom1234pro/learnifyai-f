import { useState, useEffect } from "react";
import document from "../../assets/document.svg";
import image from "../../assets/image.svg";
import logo from "../../assets/logo.png";
import ThoughtInput from "../../components/ChatComponent/ThoughtInput";
import Header from "../../components/Header";
import UploadDocument from "../../components/ChatComponent/UploadDocument";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// eslint-disable-next-line react/prop-types
const NewChat = ({isOpen, setIsOpen}) => {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [userName, setUserName] = useState("Anonymous");
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // setUserId(user.uid);
        setUserName(user.displayName || "Anonymous"); // Use displayName from Firebase Auth
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);
  
  return (
    <div className="flex-1 bg-gradient-to-br from-[#ffffff] via-[#e7dbe9ac] to-[#A362A880] relative" >

    <Header isOpen={isOpen} setIsOpen={setIsOpen}/>
    <div className="flex flex-col items-start sm:items-center lg:pt-[2rem] pt-[5rem] px-2">
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
      <div className="flex flex-col w-full sm:text-center">
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

      {/* Upload Options */}
      <div className="mt-6 flex flex-row gap-4 justify-center w-full max-w-md lg:max-w-2xl">
        <div 
        onClick={() => setIsDocumentModalOpen(true)}
        className="cursor-pointer flex flex-col items-center py-4 px-[0.5rem] text-center border border-[#d9baf9] rounded-lg w-full lg:w-[360px]">
          <img src={document} alt="upload document" className="w-8 h-8" />
          <h3 className="font-semibold text-[#282A2F] text-[12px] md:text-base my-[0.6rem]">Upload Your Document</h3>
          <p className="text-[8px] md:text-sm text-[#696F79] mb-3">Select a document to get started. Supported formats: PDF, DOC, DOCX, TXT</p>
        </div>
        <div
        onClick={() => setIsImageModalOpen(true)}
        className="cursor-pointer flex flex-col items-center py-4 px-[0.5rem] text-center border border-[#d9baf9] rounded-lg w-full lg:w-[360px]">
          <img src={image} alt="upload image" className="w-8 h-8" />
          <h3 className="font-semibold text-[#282A2F] text-[12px] md:text-base my-[0.6rem]">Upload Your Image</h3>
          <p className="text-[8px] md:text-sm text-[#696F79] mb-3">Choose an image to interact with. Supported formats: JPG, PNG, GIF.</p>
        </div>
      </div>

      {/* Chat Input */}
      <UploadDocument isOpen={isDocumentModalOpen} setIsOpen={setIsDocumentModalOpen} title={"Document Upload"}  supportedMedia={"Only supports PDF, DOC, DOCX, TXT"}/>
      <UploadDocument isOpen={isImageModalOpen} setIsOpen={setIsImageModalOpen} title={"Image Upload"} supportedMedia={"Only supports JPG, PNG, GIF"}/>
    </div>
      <div className="sm:w-[90%] w-[100%] bottom-0 absolute sm:mt-2 sm:static mx-auto">
        <ThoughtInput />
      </div>
    </div>

  );
};
  
  export default NewChat;