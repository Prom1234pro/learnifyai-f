import { RotateCw, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import Logo from "../../assets/logo.png";
import MarkdownTypewriter from "./MarkdownTypewriter";

// eslint-disable-next-line react/prop-types
const ChatMessage = ({  timestamp, message, current }) => {
  return (
    <div className="w-full">
      {/* Sender Name and Timestamp */}
      <div className="flex items-center gap-2 text-[#8D99AB] text-sm">
        <img src={Logo} alt="AI Icon" className="w-8 h-8" />
        
        {/* <span className="font-semibold text-xl bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text">{sender}</span> */}
        <span>{timestamp}</span>
      </div>

      {/* Message Content */}
      <MarkdownTypewriter text={message} current={current}/>
      {/* <p className="text-gray-800 mt-2">{message}</p> */}

      {/* Action Icons */}
      <div className="flex items-center mt-3 space-x-4 text-[5px] text-[#8D99AB]">
        <ThumbsUp size={15} className="cursor-pointer hover:text-gray-700" />
        <ThumbsDown size={15} className="cursor-pointer hover:text-gray-700" />
        <Copy size={15} className="cursor-pointer hover:text-gray-700" />
        <RotateCw size={15} className="cursor-pointer hover:text-gray-700" />
      </div>
    </div>
  );
};

export default ChatMessage;
