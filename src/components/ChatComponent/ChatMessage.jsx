import { RotateCw, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../assets/logo.png";
import Pen from "../../assets/pen.svg";
import MarkdownTypewriter from "./MarkdownTypewriter";

const AnimatedPen = () => {
  return (
    <div className="translate-x-[8px]">
      <motion.img
        src={Pen}
        alt="Pen Writer"
        className="w-5 h-5"
        animate={{
          scale: [1, 1.2, 1], // Grows and shrinks
          y: [0, -5, 0], // Moves up and down
        }}
        transition={{
          duration: 0.8, // Smooth transition
          repeat: Infinity, // Loops forever
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const ChatMessage = ({ messageLoading, timestamp, message, current }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message)
      .then(() => {
        // Optional: Provide feedback to the user (e.g., a toast message)
        alert('Message copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        // Optional: Handle errors (e.g., show an error message)
        alert('Failed to copy message. Please try again.');
      });
    }
    
  return (
    <div className="w-full">
      {/* Sender Name and Timestamp */}
      <div className="flex items-center gap-2 text-[#8D99AB] text-sm">
        <img src={Logo} alt="AI Icon" className="w-8 h-8" />
        
        {/* <span className="font-semibold text-xl bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text">{sender}</span> */}
        <span>{timestamp}</span>
      </div>

      {/* Message Content */}
      { messageLoading && current? <div className="text-red-500">        
        <AnimatedPen />
      </div>:
      <>
      <MarkdownTypewriter text={message} current={current}/>

      <div className="flex items-center mt-3 space-x-4 text-[5px] text-[#8D99AB]">
        <ThumbsUp size={15} className="cursor-pointer hover:text-gray-700" />
        <ThumbsDown size={15} className="cursor-pointer hover:text-gray-700" />
        <Copy onClick={handleCopy} size={15} className="cursor-pointer hover:text-gray-700" />
      </div>
      </>
      }
    </div>
  );
};

export default ChatMessage;
