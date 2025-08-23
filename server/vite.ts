import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { autoConfig } from "./config.js";

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
  const { nanoid } = await import("nanoid");
  
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), 'vite.config.ts'),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Não fazer exit automaticamente, deixar o servidor continuar
        console.warn('Vite error (não fatal):', msg);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Middleware para headers anti-cache em desenvolvimento
  app.use((req, res, next) => {
    if (req.path.startsWith('/src/') || req.path.startsWith('/@vite/')) {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Dev-Mode': 'true',
        'X-Build-Time': new Date().toISOString(),
      });
    }
    next();
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
      
      // Adicionar timestamp único para evitar cache
      const timestamp = nanoid();
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${timestamp}"`,
      );
      
      const page = await vite.transformIndexHtml(url, template);
      
      // Headers anti-cache para HTML
      res.status(200).set({ 
        "Content-Type": "text/html",
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Dev-Mode': 'true',
        'X-Build-Time': new Date().toISOString(),
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for the build directory
  const possiblePaths = [
    path.resolve(import.meta.dirname, "..", "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve("/workspace", "dist", "public"),
    path.resolve("/app", "dist", "public"),
  ];

  let publicPath: string | null = null;
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      publicPath = testPath;
      console.log(`[PRODUCTION] Found build directory at: ${publicPath}`);
      break;
    }
  }

  if (!publicPath) {
    console.error(`[ERROR] Build directory not found. Tried paths:`);
    possiblePaths.forEach(p => console.error(`  - ${p}: ${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`));
    console.error(`[ERROR] Current working directory: ${process.cwd()}`);
    console.error(`[ERROR] __dirname: ${import.meta.dirname}`);
    
    // List directories in current working directory
    const cwdContents = fs.readdirSync(process.cwd());
    console.error(`[ERROR] Contents of ${process.cwd()}:`, cwdContents);
    return;
  }

  // List files in public directory for debugging
  try {
    const files = fs.readdirSync(publicPath, { recursive: true }) as string[];
    console.log('[PRODUCTION] Files in public directory:', files.slice(0, 10), files.length > 10 ? `... and ${files.length - 10} more` : '');
  } catch (e) {
    console.log('[PRODUCTION] Could not list files in public directory');
  }
  
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
      nodeEnv: autoConfig.get('NODE_ENV')
    });
  });

  // Serve uploads directory for images (workspace)
  // REMOVED: This is now configured in routes.ts to avoid conflicts with Vite's catch-all route
  // const uploadsPath = path.join(process.cwd(), 'uploads');
  // if (fs.existsSync(uploadsPath)) {
  //   app.use('/uploads', express.static(uploadsPath, {
  //     maxAge: '1y',
  //     etag: true,
  //     lastModified: true,
  //     setHeaders: (res, filePath) => {
  //       // Headers específicos para imagens
  //       if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
  //         res.set({
  //           'Cache-Control': 'public, max-age=86400', // 1 dia
  //           'X-Image-Cache': 'medium-term',
  //         });
  //       }
  //     }
  //   }));
  //   console.log('Serving uploads from workspace:', uploadsPath);
  // }

  // Middleware para headers de cache consistentes
  app.use((req, res, next) => {
    const path = req.path;
    
    // Headers anti-cache para HTML e rotas da aplicação
    if (path === '/' || path.endsWith('.html') || path.startsWith('/admin') || path.startsWith('/planos') || path.startsWith('/sobre') || path.startsWith('/contato') || path.startsWith('/faq') || path.startsWith('/rede-credenciada')) {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-No-Cache': 'true',
        'X-Build-Time': new Date().toISOString(),
      });
    } else if (path.match(/\.(js|css)$/)) {
      // Cache longo para assets com hash
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 ano
        'X-Asset-Cache': 'long-term',
      });
    } else if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
      // Cache médio para imagens
      res.set({
        'Cache-Control': 'public, max-age=86400', // 1 dia
        'X-Image-Cache': 'medium-term',
      });
    }
    next();
  });

  // Serve static assets with proper headers
  app.use(express.static(publicPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Log apenas para debug
      if (autoConfig.get('NODE_ENV') === 'development') {
        console.log(`Serving static file: ${filePath}`);
      }
      
      // Headers específicos para imagens
      if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
        res.set({
          'Cache-Control': 'public, max-age=86400', // 1 dia
          'X-Image-Cache': 'medium-term',
        });
      }
      
      // Headers para assets CSS e JS
      if (filePath.match(/\.(css|js)$/)) {
        res.set({
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 ano
          'X-Asset-Cache': 'long-term',
        });
      }
    }
  }));
  
  // Rota específica para servir imagens com melhor tratamento de erro
  app.get('/assets/*', (req, res) => {
    const imagePath = path.join(publicPath, req.path);
    
    console.log(`[IMAGE] Request for: ${req.path}`);
    console.log(`[IMAGE] Full path: ${imagePath}`);
    console.log(`[IMAGE] Path exists: ${fs.existsSync(imagePath)}`);
    
    if (fs.existsSync(imagePath)) {
      const ext = path.extname(imagePath).toLowerCase();
      if (ext.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        res.set({
          'Cache-Control': 'public, max-age=86400',
          'X-Image-Cache': 'medium-term',
        });
        res.sendFile(imagePath, (err) => {
          if (err) {
            console.error(`[IMAGE] Error sending file: ${imagePath}`, err);
            res.status(500).send('Error serving image');
          }
        });
      } else {
        console.warn(`[IMAGE] Invalid format: ${ext}`);
        res.status(400).send('Invalid image format');
      }
    } else {
      console.warn(`[IMAGE] Not found: ${imagePath}`);
      res.status(404).send('Image not found');
    }
  });
  
  // Rota específica para servir arquivos da pasta public
  app.get('/public/*', (req, res) => {
    const filePath = path.join(publicPath, req.path.replace('/public', ''));
    
    console.log(`[PUBLIC] Request for: ${req.path}`);
    console.log(`[PUBLIC] Full path: ${filePath}`);
    console.log(`[PUBLIC] Path exists: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error(`[PUBLIC] Error sending file: ${filePath}`, err);
          res.status(500).send('Error serving file');
        }
      });
    } else {
      console.warn(`[PUBLIC] Not found: ${filePath}`);
      res.status(404).send('File not found');
    }
  });

  // Serve index.html for all routes (SPA fallback)
  app.get("*", (req, res) => {
    try {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        // Headers anti-cache para HTML principal
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Prod-Mode': 'true',
          'X-Build-Time': new Date().toISOString(),
        });
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
