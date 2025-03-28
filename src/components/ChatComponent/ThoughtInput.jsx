import { useState, useRef, useEffect } from "react";
import brain from "../../assets/brain.png";
import { Send, Plus, Book } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { upload } from "../../api";
import Library from './Library';
import "./progress.css";

// eslint-disable-next-line react/prop-types
const ThoughtInput = ({ onSend }) => {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to determine file type based on extension
  const getFileType = (file) => {
    return file.name.split('.').pop().toLowerCase();
  };

  // Toggle popup visibility
  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  // Handle file upload (both images and documents)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = getFileType(file); // Use the same getFileType function
    const reader = new FileReader();

    reader.onload = async (event) => {
      const previewData = event.target.result;

      // Add the file to selectedFiles state with initial progress
      setSelectedFiles((prev) => [
        ...prev,
        {
          file,
          type: fileType, // Use the correct file type (e.g., "pdf", "jpg", etc.)
          data: previewData,
          fileUri: "",
          progress: 0,
          uploading: true,
          name: file.name,
          selectedPages: fileType === "pdf" ? [] : null,
        },
      ]);

      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true)
      try {
        const fileUri = await upload(formData, (progress) => {
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, progress } : f
            )
          );
        });

        // Update state with the uploaded file URL
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, fileUri: fileUri.file_uri, uploading: false } : f
          )
        );
      } catch (error) {
        console.error("Upload failed:", error);
      }finally {
        setIsUploading(false);
      }
    };

    if (fileType === "jpg" || fileType === "jpeg" || fileType === "png" || fileType === "gif") {
      reader.readAsDataURL(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle sending message with selected files
  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    const messageData = {
      message: input,
      file_uris: selectedFiles.map((file) => file.fileUri).filter((uri) => uri),
    };
    onSend(messageData);

    // Clear input and selected files after sending
    setInput("");
    setSelectedFiles([]);
  };

  // Remove a file by name
  const removeFile = (name) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.name === name);
      if (fileToRemove?.data) {
        URL.revokeObjectURL(fileToRemove.data);
      }
      return prev.filter((f) => f.name !== name);
    });
  };

  const dynamicHeight = `${input.split("\n").length * 1.5}rem`;

  return (
    <div className="flex flex-col px-4 pb-2 gap-4 bg-[#fefefe] rounded-3xl w-full mx-auto border border-gray-200 shadow-md">
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative">
              {file.type === "jpg" || file.type === "jpeg" || file.type === "png" || file.type === "gif" ? (
                <img
                  src={file.data}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 flex flex-col items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                  <span className="text-xs text-gray-600 truncate w-full text-center">
                    {file.name}
                  </span>
                </div>
              )}
              {file.uploading && (
                <div className="progress-container">
                  <svg className="progress-circle" viewBox="0 0 36 36">
                    <path className="progress-bg" d="M18 2.084a 15.916 15.916 0 0 1 0 31.832" />
                    <path
                      className="progress-bar"
                      d="M18 2.084a 15.916 15.916 0 0 1 0 31.832"
                      strokeDasharray={`${file.progress}, 100`}
                    />
                  </svg>
                  <span className="progress-text">{file.progress}%</span>
                </div>
              )}
              <button
                onClick={() => removeFile(file.name)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Brain Icon & Textarea */}
      <div className="flex items-start space-x-3 pt-4">
        <img src={brain} alt="Brain Icon" className="w-6 h-6" />
        <textarea
          className="w-full bg-transparent resize-none outline-none text-[16px] chat-input-area form-input placeholder:text-slate-400/70 custom-scrollbar"
          placeholder="What’s on your mind?..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              if (window.innerWidth > 768) {
                e.preventDefault();
                handleSend();
              }
            }
          }}
          style={{ height: dynamicHeight, minHeight: "2.8rem", maxHeight: "12rem", overflowY: "auto" }}
          spellCheck={true}
        />
      </div>

      {/* Icons */}
      <div className="flex w-full items-center justify-between space-x-4 text-gray-400">
        <div className="flex gap-4">
          {/* Plus Icon for File Upload */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="hover:text-gray-600 bg-[white] border-2 border-[#e8e8e8] text-[#787878] w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f1f1f1] transition-all"
          >
            <Plus size={20} />
          </button>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Book Icon for Popup */}
          <button
            onClick={togglePopup}
            className="hover:text-gray-600 bg-[white] border-2 border-[#e8e8e8] text-[#787878] w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f1f1f1] transition-all rotate-45"

            // className="hover:text-gray-600 bg-purple-600 border-2 border-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-purple-700 transition-all"
          >
            <Book size={20} />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() && (selectedFiles.length === 0 || isUploading)}
          className={`p-2 rounded-full shadow-md transition-transform
            ${
              !input.trim() && (selectedFiles.length === 0 || isUploading)
                ? "bg-gray-300"
                : "bg-gradient-to-r from-[#632366] to-[#44798E] text-white hover:scale-105"
            }`}
          >
          <Send size={18} />
        </button>
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl">
            <p className="text-lg font-semibold mb-4">Library Content</p>
            <Library
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
            />
            <button
              onClick={togglePopup}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtInput;