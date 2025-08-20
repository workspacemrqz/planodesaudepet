import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Import Vite dynamically only in development
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfigModule = await import("../vite.config.js");
  const viteConfig = viteConfigModule.default;
  const { nanoid } = await import("nanoid");
  
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist");
  const publicPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  console.log(`Attempting to serve static files from: ${publicPath}`);
  
  if (!fs.existsSync(publicPath)) {
    console.error(`Build directory not found at ${publicPath}. Make sure to run 'npm run build' first.`);
    return;
  }

  // List files in public directory for debugging
  const files = fs.readdirSync(publicPath, { recursive: true });
  console.log('Files in public directory:', files);
  
  // Add health check endpoint
  app.get('/health', (req, res) => {
    const indexPath = path.resolve(publicPath, 'index.html');
    let indexContent = '';
    try {
      indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8').substring(0, 500) : '';
    } catch (e) {
      indexContent = 'Error reading index.html';
    }
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      publicPath,
      filesExist: fs.existsSync(publicPath),
      indexExists: fs.existsSync(indexPath),
      indexPreview: indexContent,
      assetsPath: path.resolve(publicPath, 'assets'),
      assetsExist: fs.existsSync(path.resolve(publicPath, 'assets')),
      nodeEnv: process.env.NODE_ENV
    });
  });

  // Debug middleware to log all requests
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Serve static assets with proper headers
  app.use(express.static(publicPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      console.log(`Serving static file: ${path}`);
    }
  }));

  // Serve index.html for all routes (SPA fallback)
  app.get("*", (req, res) => {
    try {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`Index file not found at ${indexPath}`);
        res.status(404).send('Application not found');
      }
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Internal server error');
    }
  });
}
