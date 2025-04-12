import { users, type User, type InsertUser, groups, messages, groupMembers, type Group, type Message, type GroupMember, type InsertGroup, type InsertMessage, type InsertGroupMember } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Storage interface with CRUD methods for all entities
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  updateUserTheme(id: number, theme: string): Promise<User | undefined>;
  
  // Group methods
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  getAllGroups(): Promise<Group[]>;
  getGroupsByUser(userId: number): Promise<Group[]>;
  
  // Group Member methods
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: number): Promise<boolean>;
  updateGroupMemberRole(groupId: number, userId: number, role: string): Promise<GroupMember | undefined>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getGroupMessages(groupId: number, limit?: number): Promise<Message[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // This will cascade delete all user's group memberships and messages
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }
  
  async updateUserTheme(id: number, theme: string): Promise<User | undefined> {
    return this.updateUser(id, { theme });
  }
  
  // Group methods
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }
  
  async createGroup(group: InsertGroup): Promise<Group> {
    const [createdGroup] = await db.insert(groups).values(group).returning();
    return createdGroup;
  }
  
  async updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group | undefined> {
    const [group] = await db
      .update(groups)
      .set({
        ...groupData,
        // Update lastActivity whenever group is updated
        lastActivity: new Date()
      })
      .where(eq(groups.id, id))
      .returning();
    return group;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id)).returning({ id: groups.id });
    return result.length > 0;
  }
  
  async getAllGroups(): Promise<Group[]> {
    return db.select().from(groups).orderBy(desc(groups.lastActivity));
  }
  
  async getGroupsByUser(userId: number): Promise<Group[]> {
    const userGroups = await db
      .select({
        group: groups
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groups.lastActivity));
    
    return userGroups.map(row => row.group);
  }
  
  // Group Member methods
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [groupMember] = await db.insert(groupMembers).values(member).returning();
    
    // Update the group's last activity time
    await db
      .update(groups)
      .set({ lastActivity: new Date() })
      .where(eq(groups.id, member.groupId));
      
    return groupMember;
  }
  
  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .returning({ id: groupMembers.id });
    
    // Update the group's last activity time
    if (result.length > 0) {
      await db
        .update(groups)
        .set({ lastActivity: new Date() })
        .where(eq(groups.id, groupId));
    }
    
    return result.length > 0;
  }
  
  async updateGroupMemberRole(groupId: number, userId: number, role: string): Promise<GroupMember | undefined> {
    const [member] = await db
      .update(groupMembers)
      .set({ role })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .returning();
    
    return member;
  }
  
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
  }
  
  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db.insert(messages).values(message).returning();
    
    // Update the group's last activity time
    await db
      .update(groups)
      .set({ lastActivity: new Date() })
      .where(eq(groups.id, message.groupId));
      
    return createdMessage;
  }
  
  async getGroupMessages(groupId: number, limit: number = 100): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.groupId, groupId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }
}

// Export database storage instance
export const storage = new DatabaseStorage();
