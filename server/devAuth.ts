import { Request, Response, NextFunction } from "express";
import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Test user data
const TEST_USER: User = {
  id: "test-user-123",
  email: "jibrinb271@gmail.com",
  firstName: "Bashir",
  lastName: "Muhammad",
  role: "admin",
  profileImageUrl: "",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Configure session store
const pgSession = connectPg(session);
const sessionStore = new pgSession({
  conString: process.env.DATABASE_URL,
  tableName: 'sessions',
  createTableIfMissing: true
});

// Configure Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    // In a real app, you would fetch the user from your database here
    // For now, we'll just use our test user
    done(null, TEST_USER);
  } catch (error) {
    done(error);
  }
});

// Middleware to automatically log in a test user
export function autoLogin(req: any, res: Response, next: NextFunction) {
  // Skip if already logged in
  if (req.user) return next();
  
  // Manually set the user on the request
  req.user = TEST_USER;
  next();
}

// Simple middleware to check if user is authenticated
export function ensureAuthenticated(req: any, res: Response, next: NextFunction) {
  // In development, always consider user as authenticated
  if (process.env.NODE_ENV === 'development') {
    req.user = req.user || { ...TEST_USER, isAdmin: true };
    return next();
  }
  
  // In production, you might want to check for actual authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Not authenticated' });
}

// Simple auth routes for development
export function setupDevAuth(app: any) {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
  }));
  
  // Initialize Passport and session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Auto-login middleware for all routes
  app.use(autoLogin);
  
  // Login route (just returns the test user)
  app.get('/api/login', (req: any, res: Response) => {
    res.json({ user: req.user });
  });
  
  // Logout route
  app.get('/api/logout', (req: any, res: Response) => {
    req.logout((err: any) => {
      if (err) return res.status(500).json({ message: 'Error logging out' });
      res.json({ message: 'Logged out' });
    });
  });
  
  // Get current user
  app.get('/api/auth/user', (req: any, res: Response) => {
    res.json(req.user || null);
  });
}
