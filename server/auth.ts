import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password for storing securely
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a supplied password with the stored hash
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Create a strong random secret
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Update last login time
          const updatedUser = await storage.updateUser(user.id, {
            lastLogin: new Date()
          });
          return done(null, updatedUser || user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // User registration
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Set defaults for theme and avatarColor if not provided
      const theme = req.body.theme || "dark";
      const avatarColor = req.body.avatarColor || generateRandomColor();

      const user = await storage.createUser({
        ...req.body,
        theme,
        avatarColor,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // User login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User | false) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: "Invalid username or password" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // User logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });

  // Update user profile
  app.put("/api/user", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = (req.user as User).id;
      
      // If username is being changed, check if it already exists
      if (req.body.username && req.body.username !== (req.user as User).username) {
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // If password is being changed, hash it
      if (req.body.password) {
        req.body.password = await hashPassword(req.body.password);
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete account
  app.delete("/api/user", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = (req.user as User).id;
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log out the user after deleting
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    } catch (error) {
      next(error);
    }
  });

  // Update user theme
  app.put("/api/user/theme", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = (req.user as User).id;
      const { theme } = req.body;
      
      if (!theme || (theme !== "dark" && theme !== "light")) {
        return res.status(400).json({ message: "Invalid theme value. Must be 'dark' or 'light'" });
      }
      
      const updatedUser = await storage.updateUserTheme(userId, theme);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
}

// Generate a random color for user avatar
function generateRandomColor(): string {
  const colors = [
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", 
    "#009688", "#4caf50", "#8bc34a", "#cddc39", 
    "#ffc107", "#ff9800", "#ff5722", "#795548"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}