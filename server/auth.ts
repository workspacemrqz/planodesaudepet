import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { AdminUser as SelectAdminUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectAdminUser {}
  }
}

// Password hashing functions removed - no longer needed for .env authentication

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "unipet-admin-secret-key",
    resave: false,
    saveUninitialized: false,
    // Session store removed - using default memory store for simplicity
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Get credentials directly from environment variables
      const adminUsername = process.env.LOGIN;
      const adminPassword = process.env.SENHA;
      
      // Validate environment variables are set
      if (!adminUsername || !adminPassword) {
        console.error('LOGIN and SENHA environment variables must be defined in .env file');
        return done(null, false);
      }
      
      // Check credentials against environment variables
      if (username === adminUsername && password === adminPassword) {
        // Create a user object for the session
        const user = {
          id: 'admin',
          username: adminUsername,
          password: '', // Don't store password in session
          createdAt: new Date()
        };
        return done(null, user);
      } else {
        return done(null, false);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      // For the new auth system, we only have one admin user
      if (id === 'admin') {
        const adminUsername = process.env.LOGIN;
        if (adminUsername) {
          const user = {
            id: 'admin',
            username: adminUsername,
            password: '',
            createdAt: new Date()
          };
          return done(null, user);
        }
      }
      return done(null, false);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  // Admin login route
  app.post("/api/admin/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  // Admin logout route
  app.post("/api/admin/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Admin user info route
  app.get("/api/admin/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// This function is no longer needed as we authenticate directly from .env variables
// export async function initializeAdminUser() {
//   // Authentication now uses LOGIN and SENHA from .env directly
//   // No database operations required
// }

export async function validateAdminCredentials() {
  // Validate that required environment variables are set
  const adminUsername = process.env.LOGIN;
  const adminPassword = process.env.SENHA;
  
  if (!adminUsername || !adminPassword) {
    throw new Error("LOGIN and SENHA environment variables must be defined in .env file");
  }
  
  console.log(`Admin credentials validated from .env: username='${adminUsername}'`);
  return true;
}