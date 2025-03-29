import { useState, useEffect } from "react";
import { PauseCircle, XCircle } from "lucide-react";

// eslint-disable-next-line react/prop-types
export default function UploadProgress({ fileName, uploadProgress, onCancel }) {
  const [progress, setProgress] = useState(65);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paused && progress < 100) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 100));
        setTimeRemaining((prev) => Math.max(prev - 5, 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [progress, paused]);

  const getStatus = (progress) => {
    if (progress === 100) return "success";
    if (progress < 0) return "failed"; // Assuming -1 or negative indicates failure
    return "uploading";
  };

  const status = getStatus(uploadProgress);

  return (
    <div className="w-full max-w-md p-4 rounded-lg border bg-white shadow-md">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-gray-800">Uploading...</p>
        <div className="flex gap-2">
          <button onClick={() => setPaused(!paused)}>
            <PauseCircle className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
          <button onClick={() => setProgress(0)}>
            <XCircle className="w-5 h-5 text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-1">
        {progress}% • {timeRemaining} seconds remaining
      </p>

      <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-purple-700 via-blue-500 to-teal-400"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
