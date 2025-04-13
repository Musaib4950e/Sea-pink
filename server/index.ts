```
import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";

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
  members: string[];
  ownerId: string;
}

interface Message {
  id: string;
  user: User;
  groupId: string;
  content: string;
  timestamp: Date;
}

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users: User[] = [];
const groups: Group[] = [];
const messages: Message[] = [];

const handleError = (error: any, socket: any) => {
  console.error("Error:", error);
  socket.emit("error", { message: "An error occurred" });
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", (username: string) => {
    try {
      const existingUser = users.find((u) => u.username === username);
      if (existingUser) {
        if (existingUser.socketId !== socket.id) {
          existingUser.socketId = socket.id;
          socket.emit("userList", users);
          socket.emit("groupList", groups);
          return;
        }
        socket.emit("authError", { message: "Username already taken" });
        return;
      }

      const newUser: User = {
        id: socket.id,
        username,
        socketId: socket.id,
      };
      users.push(newUser);

      socket.emit("userList", users);
      socket.broadcast.emit("userJoined", newUser);
      socket.emit("groupList", groups);
    } catch (error) {
      handleError(error, socket);
    }
  });

  socket.on("disconnect", () => {
    const userIndex = users.findIndex((u) => u.socketId === socket.id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      io.emit("userLeft", socket.id);
    }
  });

  // Other socket events...
});

registerRoutes(app).then(async () => {
  await setupVite(app, httpServer);
  const PORT = 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```
