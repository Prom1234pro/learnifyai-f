/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import MarkdownPreview from '@uiw/react-markdown-preview';
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";
// import rehypeRaw from "rehype-raw";
import './markdown.css'

function MarkdownTypewriter({ text, speed = 3, chunkSize = 6, current = false }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [index]);

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
      <MarkdownPreview style={{
        background: "transparent"
      }} source={displayedText}/>
        
      <div ref={messagesEndRef} />
    </>
  );
}

export default MarkdownTypewriter;
