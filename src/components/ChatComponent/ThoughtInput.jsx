import { useState, useRef } from "react";
import imgIcon from "../../assets/img.svg";
import docIcon from "../../assets/doc.svg";
import brain from "../../assets/brain.png";
import { Send } from "lucide-react";

// eslint-disable-next-line react/prop-types
const ThoughtInput = ({ onSend }) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]); // Unified state for all attachments
  const fileInputRef = useRef(null); // Ref for image upload input
  const docInputRef = useRef(null);  // Ref for document upload input

  // Handle sending the input with text and attachments
  const handleSend = () => {
    if (input.trim() || attachments.length > 0) {
      onSend({ text: input, attachments });
      setInput("");
      setAttachments([]);
    }
  };

  // Handle pasting images from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Image = event.target.result;
          setAttachments((prev) => [...prev, { type: "image", data: base64Image }]);
        };
        reader.readAsDataURL(blob);
        e.preventDefault();
      }
    }
  };

  // Handle image upload via file input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setAttachments((prev) => [...prev, { type: "image", data: base64Image }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document upload via file input
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachments((prev) => [...prev, { type: "doc", name: file.name, file }]);
    }
  };

  // Remove an attachment by index
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate dynamic height for textarea
  const lines = input.split("\n").length;
  const dynamicHeight = `${lines * 1.5}rem`;

  return (
    <div className="flex flex-col p-4 gap-4 bg-[#f7f7f8] rounded-md w-full max-w-[800px] mb-6 mx-auto border border-gray-200 sticky bottom-2 shadow-sm">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative">
              {attachment.type === "image" ? (
                <img
                  src={attachment.data}
                  alt={`Attachment ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 flex flex-col items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                  <img src={docIcon} alt="Doc Icon" className="w-8 h-8" />
                  <span className="text-xs text-gray-600 truncate w-full text-center">
                    {attachment.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Brain Icon & Textarea */}
      <div className="flex items-start space-x-3 py-4">
        <img src={brain} alt="Brain Icon" className="w-6 h-6 mt-1" />
        <textarea
          className="w-full bg-transparent resize-none outline-none text-lg text-[1rem] chat-input-area form-input placeholder:text-slate-400/70"
          placeholder="What’s on your mind?..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onPaste={handlePaste}
          style={{
            height: dynamicHeight,
            minHeight: "2.8rem",
            maxHeight: "15rem",
            overflowY: "auto",
          }}
          spellCheck={false}
        />
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-4 text-gray-400">
        {/* Image Upload Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="hover:text-gray-600"
        >
          <img src={imgIcon} alt="Image Icon" className="w-5 h-5" />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Document Upload Button */}
        <div className="h-[20px] border border-r-[#b0b0b0]"></div>
        <button
          onClick={() => docInputRef.current.click()}
          className="hover:text-gray-600"
        >
          <img src={docIcon} alt="Doc Icon" className="w-5 h-5" />
        </button>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          ref={docInputRef}
          onChange={handleDocUpload}
          className="hidden"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="absolute right-4 bottom-4 bg-gradient-to-r from-[#632366] to-[#44798E] text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform"
      >
        <Send size={18} />
      </button>
    </div>
  );
};

export default ThoughtInput;