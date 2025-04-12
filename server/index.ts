import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";

// Types
interface User {
  id: string;
  username: string;
  socketId: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  hasPassword: boolean;
  password?: string;
  members: string[]; // Array of user IDs
  ownerId: string;
}

interface Message {
  id: string;
  user: User;
  groupId: string;
  content: string;
  timestamp: Date;
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory data stores
const users: User[] = [];
const groups: Group[] = [];
const messages: Message[] = [];

// Socket events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join the chat (login)
  socket.on("join", (username: string) => {
    // Check if username already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      // If the same user reconnects, update their socket ID
      if (existingUser.socketId !== socket.id) {
        existingUser.socketId = socket.id;
        socket.emit("userList", users);
        socket.emit("groupList", groups);
        return;
      }
      
      socket.emit("authError", { message: "Username already taken" });
      return;
    }
    
    // Create new user
    const newUser: User = {
      id: socket.id,
      username,
      socketId: socket.id
    };
    
    users.push(newUser);
    
    // Notify everyone about the new user
    socket.emit("userList", users);
    socket.broadcast.emit("userJoined", newUser);
    
    // Send group list to the new user
    socket.emit("groupList", groups);
  });
  
  // Update profile
  socket.on("updateProfile", (updatedUser: User) => {
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex].username = updatedUser.username;
      io.emit("userList", users);
    }
  });
  
  // Create a new group
  socket.on("createGroup", (groupData: Omit<Group, 'id'> & { password?: string }) => {
    const newGroup: Group = {
      id: uuidv4(),
      name: groupData.name,
      description: groupData.description,
      hasPassword: groupData.hasPassword,
      members: groupData.members,
      ownerId: groupData.ownerId,
    };
    
    // Store password separately if group has password protection
    if (groupData.hasPassword && groupData.password) {
      newGroup.password = groupData.password;
    }
    
    groups.push(newGroup);
    
    // Notify everyone about the new group
    io.emit("newGroup", {
      ...newGroup,
      password: undefined // Don't send password to clients
    });
  });
  
  // Join a group
  socket.on("joinGroup", (data: string | { groupId: string; password?: string }) => {
    let groupId: string;
    let password: string | undefined;
    
    // Handle both simple string (just groupId) and object with password
    if (typeof data === 'string') {
      groupId = data;
    } else {
      groupId = data.groupId;
      password = data.password;
    }
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      socket.emit("groupError", { message: "Group not found" });
      return;
    }
    
    const user = users.find(u => u.socketId === socket.id);
    if (!user) {
      socket.emit("authError", { message: "User not authenticated" });
      return;
    }
    
    // Check if user is already a member
    if (group.members.includes(user.id)) {
      // Get messages for this group
      const groupMessages = messages.filter(m => m.groupId === groupId);
      socket.emit("messageHistory", groupId, groupMessages);
      return;
    }
    
    // Check if group requires a password
    if (group.hasPassword) {
      if (!password) {
        socket.emit("joinGroupResponse", { 
          success: false, 
          error: "This group requires a password" 
        });
        return;
      }
      
      if (password !== group.password) {
        socket.emit("joinGroupResponse", { 
          success: false, 
          error: "Incorrect password" 
        });
        return;
      }
    }
    
    // Add user to group
    group.members.push(user.id);
    
    // Notify success
    socket.emit("joinGroupResponse", { 
      success: true, 
      group: {
        ...group,
        password: undefined
      } 
    });
    
    // Notify all clients about the updated group
    io.emit("groupUpdate", {
      ...group,
      password: undefined
    });
    
    // Get messages for this group
    const groupMessages = messages.filter(m => m.groupId === groupId);
    socket.emit("messageHistory", groupId, groupMessages);
  });
  
  // Leave a group
  socket.on("leaveGroup", (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      socket.emit("groupError", { message: "Group not found" });
      return;
    }
    
    const user = users.find(u => u.socketId === socket.id);
    if (!user) {
      socket.emit("authError", { message: "User not authenticated" });
      return;
    }
    
    // Remove user from group members
    group.members = group.members.filter(memberId => memberId !== user.id);
    
    // If group has no more members and is not the owner's group, delete it
    if (group.members.length === 0 && group.ownerId !== user.id) {
      const groupIndex = groups.findIndex(g => g.id === groupId);
      if (groupIndex !== -1) {
        groups.splice(groupIndex, 1);
        io.emit("groupDeleted", groupId);
      }
    } else {
      // Notify all clients about the updated group
      io.emit("groupUpdate", {
        ...group,
        password: undefined
      });
    }
  });
  
  // Send a message
  socket.on("sendMessage", (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const user = users.find(u => u.socketId === socket.id);
    if (!user) {
      socket.emit("authError", { message: "User not authenticated" });
      return;
    }
    
    const group = groups.find(g => g.id === messageData.groupId);
    if (!group) {
      socket.emit("messageError", { message: "Group not found" });
      return;
    }
    
    // Create new message
    const newMessage: Message = {
      id: uuidv4(),
      user,
      groupId: messageData.groupId,
      content: messageData.content,
      timestamp: new Date()
    };
    
    messages.push(newMessage);
    
    // Send message to all clients
    io.emit("newMessage", newMessage);
  });
  
  // Get message history for a group
  socket.on("messageHistory", (groupId: string) => {
    const groupMessages = messages.filter(m => m.groupId === groupId);
    socket.emit("messageHistory", groupId, groupMessages);
  });
  
  // Get group list
  socket.on("groupList", () => {
    // Send groups without passwords
    const safeGroups = groups.map(group => ({
      ...group,
      password: undefined
    }));
    socket.emit("groupList", safeGroups);
  });
  
  // Disconnect
  socket.on("disconnect", () => {
    const userIndex = users.findIndex(u => u.socketId === socket.id);
    
    if (userIndex !== -1) {
      const user = users[userIndex];
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from list
      users.splice(userIndex, 1);
      
      // Notify all clients about the user leaving
      io.emit("userLeft", user.id);
    } else {
      console.log(`Unknown user disconnected with socket ID: ${socket.id}`);
    }
  });
});

// Register API routes
registerRoutes(app).then(async () => {
  // Setup Vite for development environment
  await setupVite(app, httpServer);
  
  // Start the server
  const PORT = 5000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});