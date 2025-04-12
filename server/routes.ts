import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { User, GroupMember, Message } from "@shared/schema";

// Schemas for validation
const themeSchema = z.object({
  theme: z.enum(["dark", "light"])
});

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string(),
  hasPassword: z.boolean().default(false),
  password: z.string().optional(),
});

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  groupId: z.number().positive("Valid group ID is required"),
});

const joinGroupSchema = z.object({
  groupId: z.number().positive("Valid group ID is required"),
  password: z.string().optional(),
});

const groupRoleSchema = z.object({
  groupId: z.number().positive("Valid group ID is required"),
  userId: z.number().positive("Valid user ID is required"),
  role: z.enum(["owner", "manager", "member"]),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Web socket server for real-time chat
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/ws"
  });
  
  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    let currentUser: User | null = null;
    
    // User connected with authentication
    socket.on("user:join", async (user: User) => {
      try {
        currentUser = user;
        console.log(`User ${user.username} joined with socket ID: ${socket.id}`);
        
        // Join all groups the user is a member of
        const userGroups = await storage.getGroupsByUser(user.id);
        userGroups.forEach(group => {
          socket.join(`group:${group.id}`);
        });
        
        // Broadcast to everyone
        io.emit("user:joined", user);
      } catch (error) {
        console.error("Error in user:join:", error);
      }
    });
    
    // Create a new group
    socket.on("group:create", async (groupData: any, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        const validatedData = groupSchema.parse(groupData);
        
        // Create the group
        const group = await storage.createGroup({
          ...validatedData,
          ownerId: currentUser.id,
          avatarColor: groupData.avatarColor || generateRandomColor(),
        });
        
        // Add the creator as the owner
        await storage.addGroupMember({
          groupId: group.id,
          userId: currentUser.id,
          role: "owner",
        });
        
        // Join the socket to the group's room
        socket.join(`group:${group.id}`);
        
        // Send success response
        callback({ success: true, group });
        
        // Broadcast to everyone
        io.emit("group:created", group);
      } catch (error) {
        console.error("Error creating group:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to create group" 
        });
      }
    });
    
    // Join an existing group
    socket.on("group:join", async (data: any, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        const { groupId, password } = joinGroupSchema.parse(data);
        
        // Get the group
        const group = await storage.getGroup(groupId);
        if (!group) {
          return callback({ success: false, error: "Group not found" });
        }
        
        // Check password if required
        if (group.hasPassword && group.password !== password) {
          return callback({ success: false, error: "Incorrect password" });
        }
        
        // Check if already a member
        const members = await storage.getGroupMembers(groupId);
        const isMember = members.some(m => m.userId === currentUser!.id);
        
        if (isMember) {
          return callback({ 
            success: false, 
            error: "You are already a member of this group" 
          });
        }
        
        // Add user to group
        await storage.addGroupMember({
          groupId,
          userId: currentUser.id,
          role: "member",
        });
        
        // Join the socket to the group's room
        socket.join(`group:${groupId}`);
        
        // Send success response
        callback({ success: true, group });
        
        // Notify group members
        io.to(`group:${groupId}`).emit("group:member_joined", {
          groupId,
          user: currentUser,
        });
      } catch (error) {
        console.error("Error joining group:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to join group" 
        });
      }
    });
    
    // Send a message to a group
    socket.on("message:send", async (messageData: any, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        const { content, groupId } = messageSchema.parse(messageData);
        
        // Check if user is a member of the group
        const members = await storage.getGroupMembers(groupId);
        const isMember = members.some(m => m.userId === currentUser!.id);
        
        if (!isMember) {
          return callback({ 
            success: false, 
            error: "You are not a member of this group" 
          });
        }
        
        // Create and save the message
        const message = await storage.createMessage({
          content,
          userId: currentUser.id,
          groupId,
        });
        
        // Include user data in the message for the client
        const messageWithUser = {
          ...message,
          user: currentUser,
        };
        
        // Send success response
        callback({ success: true, message: messageWithUser });
        
        // Broadcast to group members
        io.to(`group:${groupId}`).emit("message:received", messageWithUser);
      } catch (error) {
        console.error("Error sending message:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to send message" 
        });
      }
    });
    
    // Update group details
    socket.on("group:update", async (data: any, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        const { id, ...updateData } = data;
        if (!id) {
          return callback({ success: false, error: "Group ID is required" });
        }
        
        // Get the group
        const group = await storage.getGroup(id);
        if (!group) {
          return callback({ success: false, error: "Group not found" });
        }
        
        // Check if user is owner or manager
        const members = await storage.getGroupMembers(id);
        const userRole = members.find(m => m.userId === currentUser!.id)?.role;
        
        if (userRole !== "owner" && userRole !== "manager") {
          return callback({ 
            success: false, 
            error: "You don't have permission to update this group" 
          });
        }
        
        // Update the group
        const updatedGroup = await storage.updateGroup(id, updateData);
        
        // Send success response
        callback({ success: true, group: updatedGroup });
        
        // Notify group members
        io.to(`group:${id}`).emit("group:updated", updatedGroup);
      } catch (error) {
        console.error("Error updating group:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to update group" 
        });
      }
    });
    
    // Delete a group
    socket.on("group:delete", async (groupId: number, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        // Get the group
        const group = await storage.getGroup(groupId);
        if (!group) {
          return callback({ success: false, error: "Group not found" });
        }
        
        // Check if user is owner
        if (group.ownerId !== currentUser.id) {
          return callback({ 
            success: false, 
            error: "Only the group owner can delete a group" 
          });
        }
        
        // Delete the group
        await storage.deleteGroup(groupId);
        
        // Send success response
        callback({ success: true });
        
        // Notify all users
        io.emit("group:deleted", groupId);
      } catch (error) {
        console.error("Error deleting group:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to delete group" 
        });
      }
    });
    
    // Update group member role
    socket.on("group:update_role", async (data: any, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        const { groupId, userId, role } = groupRoleSchema.parse(data);
        
        // Get the group
        const group = await storage.getGroup(groupId);
        if (!group) {
          return callback({ success: false, error: "Group not found" });
        }
        
        // Check if current user is owner
        if (group.ownerId !== currentUser.id) {
          return callback({ 
            success: false, 
            error: "Only the group owner can update member roles" 
          });
        }
        
        // Update the role
        const updatedMember = await storage.updateGroupMemberRole(groupId, userId, role);
        if (!updatedMember) {
          return callback({ success: false, error: "Failed to update role" });
        }
        
        // Send success response
        callback({ success: true, member: updatedMember });
        
        // Notify group members
        io.to(`group:${groupId}`).emit("group:role_updated", updatedMember);
      } catch (error) {
        console.error("Error updating role:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to update role" 
        });
      }
    });
    
    // Remove member from group
    socket.on("group:remove_member", async (data: any, callback: Function) => {
      try {
        if (!currentUser) {
          return callback({ success: false, error: "Not authenticated" });
        }
        
        const { groupId, userId } = data;
        if (!groupId || !userId) {
          return callback({ 
            success: false, 
            error: "Group ID and user ID are required" 
          });
        }
        
        // Get the group
        const group = await storage.getGroup(groupId);
        if (!group) {
          return callback({ success: false, error: "Group not found" });
        }
        
        // If removing self, anyone can do it
        // If removing someone else, must be owner or manager
        if (userId !== currentUser.id) {
          const members = await storage.getGroupMembers(groupId);
          const userRole = members.find(m => m.userId === currentUser!.id)?.role;
          
          if (userRole !== "owner" && userRole !== "manager") {
            return callback({ 
              success: false, 
              error: "You don't have permission to remove members from this group" 
            });
          }
          
          // Managers can't remove owners or other managers
          if (userRole === "manager") {
            const targetRole = members.find(m => m.userId === userId)?.role;
            if (targetRole === "owner" || targetRole === "manager") {
              return callback({ 
                success: false, 
                error: "Managers cannot remove owners or other managers" 
              });
            }
          }
        }
        
        // Remove the member
        const removed = await storage.removeGroupMember(groupId, userId);
        if (!removed) {
          return callback({ success: false, error: "Failed to remove member" });
        }
        
        // Leave the socket room if removing self
        if (userId === currentUser.id) {
          socket.leave(`group:${groupId}`);
        }
        
        // Send success response
        callback({ success: true });
        
        // Notify group members
        io.to(`group:${groupId}`).emit("group:member_removed", {
          groupId,
          userId,
        });
      } catch (error) {
        console.error("Error removing member:", error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to remove member" 
        });
      }
    });
    
    // Disconnect event
    socket.on("disconnect", () => {
      if (currentUser) {
        console.log(`User ${currentUser.username} disconnected`);
        io.emit("user:left", currentUser);
      } else {
        console.log(`Unknown user disconnected with socket ID: ${socket.id}`);
      }
    });
  });
  
  // API Routes
  
  // Get all groups (public info)
  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getAllGroups();
      
      // Remove passwords from response
      const safeGroups = groups.map(group => {
        const { password, ...safeGroup } = group;
        return safeGroup;
      });
      
      res.json(safeGroups);
    } catch (error) {
      console.error("Error getting groups:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get groups" 
      });
    }
  });
  
  // Get a specific group by ID
  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ success: false, error: "Invalid group ID" });
      }
      
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ success: false, error: "Group not found" });
      }
      
      // Remove password from response
      const { password, ...safeGroup } = group;
      
      res.json(safeGroup);
    } catch (error) {
      console.error("Error getting group:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get group" 
      });
    }
  });
  
  // Get group members
  app.get("/api/groups/:id/members", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ success: false, error: "Invalid group ID" });
      }
      
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error("Error getting group members:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get group members" 
      });
    }
  });
  
  // Get group messages
  app.get("/api/groups/:id/messages", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ success: false, error: "Invalid group ID" });
      }
      
      // Check if user is a member of the group
      const members = await storage.getGroupMembers(groupId);
      const isMember = members.some(m => m.userId === (req.user as User).id);
      
      if (!isMember) {
        return res.status(403).json({ 
          success: false, 
          error: "You are not a member of this group" 
        });
      }
      
      const messages = await storage.getGroupMessages(groupId);
      
      // Get user details for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => {
          const user = await storage.getUser(message.userId);
          return {
            ...message,
            user,
          };
        })
      );
      
      res.json(messagesWithUsers);
    } catch (error) {
      console.error("Error getting group messages:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get group messages" 
      });
    }
  });
  
  // Update user theme
  app.put("/api/theme", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    
    try {
      const { theme } = themeSchema.parse(req.body);
      
      const userId = (req.user as User).id;
      const updatedUser = await storage.updateUserTheme(userId, theme);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({
        success: true,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid theme value" 
      });
    }
  });
  
  return httpServer;
}

// Generate a random color
function generateRandomColor(): string {
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
    "#009688", "#4caf50", "#8bc34a", "#cddc39", 
    "#ffc107", "#ff9800", "#ff5722", "#795548"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
