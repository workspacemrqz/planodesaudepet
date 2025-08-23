import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { autoConfig } from "./config.js";
import path from "path";
import fs from "fs";

const app = express();

// Trust proxy para produção
app.set("trust proxy", 1);

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

// CORS headers para produção
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging middleware
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

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Error middleware caught:', err);
    res.status(status).json({ message });
  });

  // Serve static files from client build in production
  if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(process.cwd(), 'dist', 'client');
    
    // Serve static assets
    app.use('/assets', express.static(path.join(clientBuildPath, 'assets'), {
      maxAge: '1y',
      etag: true
    }));
    
    // Serve uploaded images from dist/uploads
    const uploadsPath = path.join(process.cwd(), 'dist', 'uploads');
    if (fs.existsSync(uploadsPath)) {
      app.use('/uploads', express.static(uploadsPath, {
        maxAge: '1y',
        etag: true
      }));
      console.log(`📁 Serving uploads from: ${uploadsPath}`);
    } else {
      console.log(`⚠️  Uploads directory not found: ${uploadsPath}`);
    }
    
    // Serve fallback images from dist/assets/fallback
    const fallbackPath = path.join(process.cwd(), 'dist', 'assets', 'fallback');
    if (fs.existsSync(fallbackPath)) {
      app.use('/fallback', express.static(fallbackPath, {
        maxAge: '1y',
        etag: true
      }));
      console.log(`📁 Serving fallback images from: ${fallbackPath}`);
    } else {
      console.log(`⚠️  Fallback directory not found: ${fallbackPath}`);
    }
    
    // Serve the React app for all non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      }
    });
  }

  // Start server
  const port = parseInt(autoConfig.get('PORT'), 10);
  const host = autoConfig.get('HOST');
  
  server.listen(port, host, () => {
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`🌍 Environment: ${autoConfig.get('NODE_ENV')}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`📦 Production mode - serving static files from dist/client`);
    }
  });
})();
