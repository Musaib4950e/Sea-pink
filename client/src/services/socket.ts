import { io } from "socket.io-client";

// For WebSocket connections in Replit, we need to use the correct protocol
const getSocketUrl = () => {
  // When using the Replit environment, just use the current origin (same domain)
  // This eliminates the need for cross-origin requests that might fail
  return window.location.origin;
};

const URL = getSocketUrl();
console.log("Connecting to Socket.io server at:", URL);

// Create the socket instance with improved connection options
export const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000
});

// Add debug listeners
socket.on("connect", () => {
  console.log("Socket connected!");
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected. Reason:", reason);
});

// Socket events for group chat functionality
export const socketEvents = {
  // Auth events
  JOIN: "join",
  USER_LIST: "userList",
  USER_JOINED: "userJoined",
  USER_LEFT: "userLeft",
  
  // Group events
  GROUP_LIST: "groupList",
  CREATE_GROUP: "createGroup",
  JOIN_GROUP: "joinGroup",
  LEAVE_GROUP: "leaveGroup",
  
  // Message events
  MESSAGE_HISTORY: "messageHistory",
  NEW_MESSAGE: "newMessage",
  SEND_MESSAGE: "sendMessage",
  
  // Error events
  ERROR: "error",
  AUTH_ERROR: "authError",
  GROUP_ERROR: "groupError"
};