import { useState, useEffect, useRef } from "react";
import MarkdownPreview from '@uiw/react-markdown-preview';
import './markdown.css'

function MarkdownTypewriter({ text, userScrolled, speed = 3, chunkSize = 6, current = false }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [index, userScrolled]);

  useEffect(() => {
    if (!current) {
      setDisplayedText(text)
      return
    }
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.slice(index, index + chunkSize));
        setIndex(index + chunkSize);
      }, speed); // Adjust typing speed

      return () => clearTimeout(timeout);
    }
  }, [index, text, speed, chunkSize, current]);

  return (
    <>
      <MarkdownPreview 
        className="markdown-preview"
        style={{
          background: "transparent", 
          color: "#111"
        }} 
        source={displayedText} 
      />
        
      <div ref={messagesEndRef} />
    </>
  );
}

export default MarkdownTypewriter;
