import { useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import upload from "../../assets/upload.svg";
import { XIcon, Trash2 } from "lucide-react";
import ActionButton from "../Buttons/ActionButton";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const UploadDocument = ({ isOpen, setIsOpen, title, supportedMedia, userId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [xhrInstance, setXhrInstance] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCancelUpload = () => {
    if (xhrInstance) {
      xhrInstance.abort(); // Cancel the request
    }
    setIsUploading(false);
    setIsProcessing(false);
    setUploadProgress(0);
    setSelectedFile(null);
    setDocumentPreview(null);
  };

  const handleUploadAndSummarize = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("file_type", supportedMedia);
    formData.append("user_id", userId);

    try {
      // Use XMLHttpRequest for upload with progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        setXhrInstance(xhr); // Save instance to allow cancellation

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed due to network error"));

        xhr.open("POST", "http://localhost:5000/upload", true);
        xhr.send(formData);
      });

      const uploadData = await uploadPromise;

      setUploadProgress(100); // Ensure it hits 100% when done
      setIsUploading(false);
      setIsProcessing(true); // Show processing state

      // Summarize the document
    const userTimestamp = new Date().toLocaleTimeString(); // User message timestamp
    const timestamp = `${Date.now()}`
    const summaryResponse = await fetch("http://localhost:5000/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        file_uris: [uploadData.file_uri],
        message: "Summarize this document",
        session_id: timestamp,
        user_id: userId,
        userTimestamp: userTimestamp, // Send user's timestamp to backend
        updateTimestamp: new Date().toISOString(),
      }),
    });
    
    // Log response before reading JSON
    console.log(summaryResponse);
    
    if (!summaryResponse.ok) {
      throw new Error("Failed to summarize document");
    }
    
    // Read JSON only once
    const summaryData = await summaryResponse.json();
    console.log(summaryData); // Log parsed JSON
    
    localStorage.setItem("summary", summaryData.response);
    console.log(summaryData.title)
    navigate(`/chat/${timestamp}`, {
      state: { initialMessage: summaryData.response, isSummary: true, name: summaryData.title, type: supportedMedia, file_uri: summaryData.file_uri },
    });

    } catch (error) {
      console.error("Error processing document:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />

        <div className="relative z-50 w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
          <Dialog.Panel>
            <div className="flex justify-between">
              <Dialog.Title className="text-lg font-semibold text-[#282A2F]">{title}</Dialog.Title>
              <XIcon onClick={() => setIsOpen(false)} className="text-gray-500 cursor-pointer" size={20} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{supportedMedia === "doc"? "Only supports PDF, DOC, DOCX, TXT": "Only supports JPG, PNG, GIF"}</p>

            {/* File Upload Section */}
            <div 
              className="mb-4 border-dashed border-2 border-gray-300 rounded-lg p-6 mt-4 flex flex-col items-center justify-center"
            >
              <img src={upload} alt="Upload" className="w-12 h-12" />
              <p className="text-sm text-gray-600">Drag and drop a file or click to upload</p>
              <p className="my-2 text-gray-500 text-xs">OR</p>
              <label className="bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent border px-4 py-2 rounded-lg cursor-pointer text-sm">
                Browse files
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={supportedMedia ==="doc"? ".pdf,.docx,.txt,":".jpg,.jpeg,.png"}
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Show Selected File Name */}
            {selectedFile && (
              <p className="text-sm text-gray-700 mt-2">Selected: {selectedFile.name}</p>
            )}

            {/* Show Upload Progress & Processing Text */}
            {(isUploading || isProcessing) && (
              <UploadProgress
                fileName={selectedFile?.name}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                isProcessing={isProcessing}
                onCancel={handleCancelUpload}
              />
            )}
            {documentPreview && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                <strong>Extracted Text:</strong>
                <p className="mt-1">{documentPreview.substring(0, 300)}...</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="border border-[#696F79] px-4 py-2 text-gray-600 bg-white rounded-md"
              >
                Cancel
              </button>
              <ActionButton text={"Next"} onClick={handleUploadAndSummarize} className="py-2" active={!!selectedFile} />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

// UploadProgress Component
// eslint-disable-next-line react/prop-types
const UploadProgress = ({ fileName, uploadProgress, isUploading, isProcessing, onCancel }) => {
  return (
    <div className="border rounded-lg p-4 w-full max-w-md bg-white flex items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{fileName}</p>

        {isUploading && (
          <>
            <p className="text-xs text-gray-600">{uploadProgress}% • Uploading...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-700 to-blue-500"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </>
        )}

        {isProcessing && <p className="text-xs text-gray-600">Processing document...</p>}
      </div>

      {(isUploading || isProcessing) && (
        <button onClick={onCancel} className="ml-2">
          <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
        </button>
      )}
    </div>
  );
};

export default UploadDocument;
