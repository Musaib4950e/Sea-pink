import { MessageProps } from "../interfaces";
import { BsCheck2All } from "react-icons/bs";

const MessageItem = ({ message, isCurrentUser }: MessageProps) => {
  // Format the timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`flex ${
        isCurrentUser ? "flex-row-reverse" : ""
      } space-x-2 max-w-sx md:max-w-md message-bubble ${
        isCurrentUser ? "space-x-reverse" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-white font-medium">
        {message.user.username.charAt(0).toUpperCase()}
      </div>
      
      <div
        className={`rounded-xl mr-2 p-3 shadow-md ${
          isCurrentUser
            ? "bg-white text-black rounded-br-none"
            : "bg-gray-800 border border-gray-700 text-white rounded-bl-none"
        }`}
      >
        <div className="flex items-baseline space-x-2 mb-1">
          <span
            className={`text-xs font-medium ${
              isCurrentUser ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {message.user.username}
            {isCurrentUser && " (You)"}
          </span>
          <span
            className={`text-xs ${
              isCurrentUser ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {isCurrentUser && (
          <div className="flex justify-end mt-1">
            <BsCheck2All className="h-3 w-3 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;