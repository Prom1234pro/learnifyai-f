import { CheckCircle, Trash2 } from "lucide-react";

// eslint-disable-next-line react/prop-types
const UploadProgress = ({ fileName, uploadProgress, onCancel }) => {
  const getStatus = (progress) => {
    if (progress === 100) return "success";
    if (progress < 0) return "failed"; // Assuming -1 or negative indicates failure
    return "uploading";
  };

  const status = getStatus(uploadProgress);

  return (
    <div className="border rounded-lg p-4 w-full max-w-md bg-white flex items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{fileName}</p>

        {status === "uploading" && (
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

        {status === "success" && (
          <p className="text-xs text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            Upload successful
          </p>
        )}

        {status === "failed" && (
          <p className="text-xs text-red-600 flex items-center">
            Upload failed
          </p>
        )}
      </div>

      {(status === "uploading" || status === "failed") && (
        <button onClick={onCancel} className="ml-2">
          <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
        </button>
      )}
    </div>
  );
};

export default UploadProgress;