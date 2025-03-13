import { useEffect, useRef } from "react";

// eslint-disable-next-line react/prop-types
const UserChatMessage = ({ message, timestamp, userName, userPhoto, userInitials }) => {
  const messagesEndRef = useRef(null); // Reference for auto-scrolling

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div className="flex justify-end">
      <div className="flex flex-col max-w-lg w-auto">
        {/* User Info */}
        <div className="ml-auto text-xs-500 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8D99AB]">{timestamp}</span>
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={`${userName}'s profile`}
                className="w-6 h-6 rounded-full object-cover"
                onError={() => {}} // Optionally handle image load errors here if needed
              />
            ) : (
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-[#632366] to-[#44798E] text-white text-xs font-bold">
                {userInitials}
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <p className="text-gray-800 text-sm bg-[#E5E7EA] rounded-md p-3">{message}</p>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default UserChatMessage;