import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./scripts/initialize-database";
import { autoConfig } from "./config";

const app = express();

// Trust proxy for proper IP handling in production
if (autoConfig.get('NODE_ENV') === 'production') {
  app.set('trust proxy', true);
}

// Configure JSON parsing to preserve line breaks and special characters
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw buffer for potential custom parsing
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb'
}));

// Add CORS headers for production
app.use((req, res, next) => {
  if (autoConfig.get('NODE_ENV') === 'production') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database schema only (no data insertion)
  if (autoConfig.get('NODE_ENV') === 'production') {
    try {
      log("Checking database schema in production...");
      await initializeDatabase();
      log("Database schema check completed - no automatic data insertion");
    } catch (error) {
      log("Database schema initialization failed:", String(error));
      // Continue anyway - the error will be caught by the API endpoints
    }
  } else {
    // In development, always try to initialize database
    try {
      log("Initializing database in development...");
      await initializeDatabase();
      log("Database initialization completed successfully");
    } catch (error) {
      log("Database initialization failed in development:", String(error));
      // Continue anyway - the error will be caught by the API endpoints
    }
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Error middleware caught:', err);
    res.status(status).json({ message });
    // Não fazer throw do erro para evitar crash do servidor
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (autoConfig.get('NODE_ENV') === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 8080 for production, 3000 for development.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(autoConfig.get('PORT'), 10);
  const host = autoConfig.get('HOST');
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
    log(`Environment: ${autoConfig.get('NODE_ENV')}`);
    log(`Cache headers: Configured for optimal performance`);
  });
})();
