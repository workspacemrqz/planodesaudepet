import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { AdminUser } from "@shared/schema";
import rateLimit from "express-rate-limit";
import { autoConfig } from "./config.js";

declare module 'express-session' {
  interface SessionData {
    user?: AdminUser;
  }
}

declare global {
  namespace Express {
    interface User extends AdminUser {}
  }
}

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// In-memory store for failed login attempts (in production, use Redis or similar)
const failedAttempts = new Map<string, { count: number; lockUntil?: number }>();

// Lockout configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

function validateEnvironmentVariables(): { username: string; password: string } | null {
  // Use LOGIN and SENHA as primary variables
  let adminUsername = autoConfig.get('LOGIN');
  let adminPassword = autoConfig.get('SENHA');
  
  // Fallback to LOGIN and SENHA for legacy support if primary variables are not set
  if (!adminUsername || !adminPassword) {
    adminUsername = autoConfig.get('LOGIN');
    adminPassword = autoConfig.get('SENHA');
    
    if (adminUsername && adminPassword) {
      console.warn('⚠️ Using legacy LOGIN/SENHA variables. Consider migrating to LOGIN/SENHA');
    }
  }
  
  if (!adminUsername || !adminPassword) {
    console.error('❌ LOGIN and SENHA (or LOGIN/SENHA) environment variables must be defined in .env file');
    return null;
  }
  
  console.log('✅ Environment variables loaded successfully');
  return { username: adminUsername, password: adminPassword };
}

function isAccountLocked(ip: string): boolean {
  const attempts = failedAttempts.get(ip);
  if (!attempts) return false;
  
  if (attempts.lockUntil && Date.now() < attempts.lockUntil) {
    return true;
  }
  
  // Reset if lockout period has passed
  if (attempts.lockUntil && Date.now() >= attempts.lockUntil) {
    failedAttempts.delete(ip);
    return false;
  }
  
  return false;
}

function recordFailedAttempt(ip: string): void {
  const attempts = failedAttempts.get(ip) || { count: 0 };
  attempts.count++;
  
  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    attempts.lockUntil = Date.now() + LOCKOUT_TIME;
    console.warn(`🔒 Account locked for IP ${ip} due to ${attempts.count} failed attempts`);
  }
  
  failedAttempts.set(ip, attempts);
}

function recordSuccessfulLogin(ip: string): void {
  failedAttempts.delete(ip);
}

export function setupAuth(app: Express) {
  // Validate environment variables on startup
  const credentials = validateEnvironmentVariables();
  if (!credentials) {
    throw new Error('Authentication setup failed: missing environment variables');
  }

  const sessionSettings: session.SessionOptions = {
    secret: autoConfig.get('SESSION_SECRET'),
    resave: true,
    saveUninitialized: true, // Changed to true to ensure session is saved
    cookie: {
      secure: false, // Secure cookies disabled for local development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'connect.sid', // Explicitly set session name
    store: undefined // Use default memory store for development
  };

  // Remove trust proxy for local development
  // app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  // Admin login route with rate limiting and security
  app.post("/api/admin/login", loginLimiter, async (req: LoginRequest, res: Response) => {
    try {
      const { username, password } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: "Username e senha são obrigatórios" });
      }
      
      // Check if account is locked
      if (isAccountLocked(clientIp)) {
        console.warn(`🔒 Login attempt on locked account from IP ${clientIp}`);
        return res.status(423).json({ 
          error: "Conta temporariamente bloqueada devido a muitas tentativas falhas. Tente novamente em 30 minutos." 
        });
      }
      
      // Get credentials from environment
      const envCredentials = validateEnvironmentVariables();
      if (!envCredentials) {
        console.error('❌ Environment variables not configured for authentication');
        return res.status(500).json({ error: "Erro de configuração do servidor" });
      }
      
      // Validate credentials (timing-safe comparison would be ideal in production)
      if (username === envCredentials.username && password === envCredentials.password) {
        // Successful login
        recordSuccessfulLogin(clientIp);
        
        const user: AdminUser = {
          id: 'admin',
          username: envCredentials.username,
          createdAt: new Date()
        };
        
        req.session.user = user;
        console.log(`✅ Successful admin login from IP ${clientIp}`);
        
        res.status(200).json(user);
      } else {
        // Failed login
        recordFailedAttempt(clientIp);
        console.warn(`❌ Failed login attempt for username "${username}" from IP ${clientIp}`);
        
        // Generic error message to prevent username enumeration
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Admin logout route
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Logout error:', err);
        return res.status(500).json({ error: "Erro ao fazer logout" });
      }
      
      console.log(`✅ Admin logout from IP ${clientIp}`);
      res.clearCookie('connect.sid'); // Clear session cookie
      res.sendStatus(200);
    });
  });

  // Admin user info route
  app.get("/api/admin/user", (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.sendStatus(401);
    }
    
    res.json(req.session.user);
  });

  // Middleware to check admin authentication - REMOVED (handled in routes.ts)
  // This was causing duplicate authentication checks
}

// Utility function to check if user is authenticated (for use in other parts of the app)
export function isAuthenticated(req: Request): boolean {
  return !!req.session.user;
}

// Middleware function for protecting routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Acesso não autorizado" });
  }
  next();
}

// Clean up expired lockouts periodically (run every hour)
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of failedAttempts.entries()) {
    if (attempts.lockUntil && now >= attempts.lockUntil) {
      failedAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);