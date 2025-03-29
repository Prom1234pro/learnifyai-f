import { useState, useRef, useEffect } from "react";
import imgIcon from "../../assets/img.svg";
import docIcon from "../../assets/doc.svg";
import brain from "../../assets/brain.png";
import { Send } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { upload } from "../../api";
import './progress.css'

// eslint-disable-next-line react/prop-types
const ThoughtInput = ({ onSend }) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]); // Unified state for all attachments
  const fileInputRef = useRef(null); // Ref for image upload input
  const docInputRef = useRef(null); 
  // const [xhrInstance, setXhrInstance] = useState(null);
  const [, setUserId] = useState(null);


  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Handle sending the input with text and attachments
  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    console.log(attachments)
    const messageData = {
      message: input,
      file_uris: attachments.map((file) => file.fileUri), // Send file URIs instead of files
    };
    console.log(messageData)
    onSend(messageData)
  };
  

  // Handle pasting images from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
  
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64Image = event.target.result;
  
          // Add to attachments as base64 temporarily (for preview)
          setAttachments((prev) => [
            ...prev, 
          { id: item.name, type: "image", data: base64Image, fileUri: "", progress: 0, uploading: true },
          ]);
  
          // Convert base64 image to Blob
          const formData = new FormData();
          formData.append("file", blob, "pasted_image.png");
  
          try {
            const fileUri = await upload(formData, (progress) => {
              setAttachments((prev) => 
                prev.map((att) => 
                  att.id === item.name ? { ...att, progress } : att
                )
              );
            }); // Upload and get file URL
            console.log("fileUri", fileUri)
            // Update state with the uploaded file URL
            setAttachments((prev) =>
              prev.map((att) =>
                att.data === base64Image ? { ...att, fileUri, uploading: false } : att
              )
            );
          } catch (error) {
            console.error("Upload failed:", error);
          }
        };
        reader.readAsDataURL(blob);
        e.preventDefault();
      }
    }
  };
  
  // Handle file upload (images or documents)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
  
        // Add the image to state with initial progress
        setAttachments((prev) => [
          ...prev,
          { id: file.name, type: "image", data: base64Image, fileUri: "", progress: 0, uploading: true },
        ]);
  
        const formData = new FormData();
        formData.append("file", file);
  
        try {
          const fileUri = await upload(formData, (progress) => {
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === file.name ? { ...att, progress } : att
              )
            );
          });
          console.log("image fileUri", fileUri)
          
          // Replace base64 preview with uploaded file URL
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === file.name ? { ...att, fileUri: fileUri.file_uri, uploading: false } : att
            )
          );
        } catch (error) {
          console.error("Upload failed:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add the document to state with initial progress
      setAttachments((prev) => [
        ...prev,
        { id: file.name, type: "doc", fileUri: "", name: file.name, progress: 0, uploading: true },
      ]);
  
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const fileUri = await upload(formData, (progress) => {
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === file.name ? { ...att, progress } : att
            )
          );
        });
  
        console.log("doc fileUri", fileUri)

        // Replace progress with uploaded file URL
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === file.name ? { ...att, fileUri: fileUri.file_uri, uploading: false } : att
          )
        );
      } catch (error) {
        console.error("Upload failed:", error);
      }
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
      <div className="flex flex-col px-4 pb-2 gap-4 bg-[#f7f7f8] rounded-2xl w-full mx-auto border border-gray-200 shadow-sm">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {attachment.type === "image" ? (
                  <>
                  <img
                    src={attachment.data}
                    alt={`Attachment ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    />
                    
                    { attachment.uploading && (<div className="progress-container">
                      <svg className="progress-circle" viewBox="0 0 36 36">
                        <path
                          className="progress-bg"
                          d="M18 2.084a 15.916 15.916 0 0 1 0 31.832"
                        />
                        <path
                          className="progress-bar"
                          d="M18 2.084a 15.916 15.916 0 0 1 0 31.832"
                          strokeDasharray={`${attachment.progress}, 100`}
                        />
                      </svg>
                      <span className="progress-text">{attachment.progress}%</span>
                    </div>)}
                   
                  </>
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
        <div className="flex items-start space-x-3 py-2">
          <img src={brain} alt="Brain Icon" className="w-6 h-6 mt-1" />
          <textarea
            className="w-full bg-transparent resize-none outline-none text-lg text-[12px] sm:text-[14px] chat-input-area form-input placeholder:text-slate-400/70"
            placeholder="What’s on your mind?..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                if (window.innerWidth > 768) { // Prevent this only on desktop
                  e.preventDefault();
                  handleSend();
                }
              }
            }}
            onPaste={handlePaste}
            style={{
              height: dynamicHeight,
              minHeight: "2.8rem",
              maxHeight: "15rem",
              overflowY: "auto",
            }}
            spellCheck={true}
          />
        </div>
  
        {/* Icons */}
        <div className="flex w-full items-center justify-between space-x-4 text-gray-400">
          {/* Image Upload Button */}
          <div className="flex gap-4">
  
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
            className="bg-gradient-to-r justify-end from-[#632366] to-[#44798E] text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
  
      </div>
    );
};

export default ThoughtInput;