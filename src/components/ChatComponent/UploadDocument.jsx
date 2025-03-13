import { useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import upload from "../../assets/upload.svg";
import { XIcon } from "lucide-react";
import ActionButton from "../Buttons/ActionButton";
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const UploadDocument = ({ isOpen, setIsOpen, title, supportedMedia }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
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

    try {
      // Use XMLHttpRequest for upload with progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

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

        xhr.open("POST", "https://learnifya1-d7a809b39e9d.herokuapp.com/upload", true);
        xhr.send(formData);
      });

      const uploadData = await uploadPromise;

      const uniqueId = `${Date.now()}`;
      const docTitle = uploadData.text.split(" ").slice(0, 5).join(" ");

      const documentData = {
        documentName: selectedFile.name,
        text: uploadData.text,
        title: docTitle,
      };

      localStorage.setItem(uniqueId, JSON.stringify(documentData));
      setDocumentPreview(uploadData.text);
      setUploadProgress(100); // Ensure it hits 100% when done

      // Summarize the document using fetch (no progress needed here)
      const summaryResponse = await fetch("https://learnifya1-d7a809b39e9d.herokuapp.com/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uploadData.text }),
      });

      if (!summaryResponse.ok) throw new Error("Failed to summarize document");

      const summaryData = await summaryResponse.json();
      localStorage.setItem(`${uniqueId}_summary`, summaryData.summary);

      navigate(`/chat/${uniqueId}`, {
        state: { initialMessage: summaryData.summary, isSummary: true, name: summaryData.title },
      });

    } catch (error) {
      console.error("Error processing document:", error);
    } finally {
      setIsUploading(false);
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
            <p className="text-xs text-gray-500 mt-2">{supportedMedia}</p>

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
                  accept=".pdf,.docx,.txt,.jpg,.png"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Show Selected File Name */}
            {selectedFile && (
              <p className="text-sm text-gray-700 mt-2">Selected: {selectedFile.name}</p>
            )}

            {/* Show Upload Progress */}
            {isUploading && (
              <UploadProgress
                fileName={selectedFile?.name}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onCancel={() => {
                  setIsUploading(false);
                  setUploadProgress(0);
                  setSelectedFile(null);
                }}
              />
            )}

            {/* Show Extracted Text Preview */}
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
const UploadProgress = ({ fileName, uploadProgress, isUploading, onCancel }) => {
  return (
    <div className="mt-4">
      <p className="text-sm text-gray-700">Uploading: {fileName}</p>
      <progress value={uploadProgress} max="100" className="w-full h-2 rounded" />
      <p className="text-sm text-gray-600 mt-1">{uploadProgress}%</p>
      {isUploading && (
        <button onClick={onCancel} className="text-red-500 mt-2 text-sm hover:underline">
          Cancel
        </button>
      )}
    </div>
  );
};

export default UploadDocument;