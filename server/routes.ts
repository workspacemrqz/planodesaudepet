import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertPlanSchema, 
  insertNetworkUnitSchema, 
  insertFaqItemSchema,
  insertSiteSettingsSchema,
  insertFileMetadataSchema 
} from "@shared/schema";
import { sanitizeText } from "./utils/text-sanitizer";
import { setupAuth, requireAuth } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import multer from "multer";
import path from "path";
import fs from "fs";
// Removed file-type dependency for simpler image handling
import { autoConfig } from "./config";
import express from "express"; // Added missing import


// Configure multer for file uploads
// In production, use a persistent directory that survives deploys
// Use writable directory in production
const uploadDir = autoConfig.get('NODE_ENV') === 'production' 
  ? path.join(process.cwd(), 'uploads')  // Use workspace uploads dir
  : path.join(process.cwd(), 'uploads');

// Ensure upload directory exists with proper error handling
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
  } else {
    console.log('Upload directory exists:', uploadDir);
  }
} catch (error) {
  console.error('Failed to create upload directory:', error);
  console.log('Falling back to temp directory...');
  // This shouldn't happen with workspace directory, but let's be safe
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const objectId = req.params.objectId;
      const ext = path.extname(file.originalname);
      cb(null, `${objectId}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to check admin authentication
const requireAdmin = (req: any, res: any, next: any) => {
  console.log('🔐 [AUTH] requireAdmin middleware called for:', req.path);
  console.log('🔐 [AUTH] Request headers:', {
    cookie: req.headers.cookie,
    'user-agent': req.headers['user-agent'],
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-real-ip': req.headers['x-real-ip']
  });
  console.log('🔐 [AUTH] Session info:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!(req.session?.user),
    user: req.session?.user
  });
  
  if (!req.session) {
    console.log('❌ [AUTH] No session found');
    return res.status(401).json({ error: "Admin authentication required - no session" });
  }
  
  if (!req.session.user) {
    console.log('❌ [AUTH] No user in session');
    return res.status(401).json({ error: "Admin authentication required - no user" });
  }
  
  console.log('✅ [AUTH] Admin authentication successful for user:', req.session.user.username);
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {

  // IMPORTANT: Configure static file serving for uploads BEFORE other routes
  // This ensures that image requests are handled before Vite's catch-all route
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        // Headers específicos para imagens
        if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
          res.set({
            'Cache-Control': 'public, max-age=86400', // 1 dia
            'X-Image-Cache': 'medium-term',
          });
        }
      }
    }));
    console.log('✅ [ROUTES] Serving uploads from workspace:', uploadsPath);
  } else {
    console.warn('⚠️ [ROUTES] Uploads directory not found:', uploadsPath);
  }
  
  // Diagnostic endpoint for production debugging
  app.get('/api/diagnostic', (req, res) => {
    const distPath = path.resolve(process.cwd(), 'dist');
    const publicPath = path.resolve(distPath, 'public');
    const uploadsPath = path.resolve(process.cwd(), 'uploads');
    
    res.json({
      status: 'ok',
      env: {
        NODE_ENV: autoConfig.get('NODE_ENV'),
        PORT: autoConfig.get('PORT'),
        DATABASE_URL: autoConfig.get('DATABASE_URL') ? 'CONFIGURED' : 'NOT CONFIGURED',
        ADMIN_AUTH: autoConfig.get('LOGIN') && autoConfig.get('SENHA') ? 'CONFIGURED' : 'NOT CONFIGURED',
      },
      paths: {
        cwd: process.cwd(),
        dist: {
          path: distPath,
          exists: fs.existsSync(distPath)
        },
        public: {
          path: publicPath,
          exists: fs.existsSync(publicPath),
          files: fs.existsSync(publicPath) ? fs.readdirSync(publicPath).slice(0, 10) : []
        },
        uploads: {
          path: uploadsPath,
          exists: fs.existsSync(uploadsPath)
        }
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Simple upload routes (before auth setup to avoid session issues)
  app.post("/api/objects/upload", async (req, res) => {
    console.log('POST /api/objects/upload - Starting upload process');
    try {
      // For local development, we'll use a simple file upload approach
      // Generate a unique filename
      const crypto = await import('crypto');
      const objectId = crypto.randomUUID();
      const objectPath = `/objects/uploads/${objectId}`;
      
      // Return relative upload URL that works in both dev and production
      const uploadURL = `/api/objects/upload-file/${objectId}`;
      
      console.log('Generated upload URL:', uploadURL);
      console.log('Generated object path:', objectPath);
      
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Erro ao obter URL de upload" });
    }
  });

  // Handle file upload (direct file in body)
  app.put("/api/objects/upload-file/:objectId", async (req, res) => {
    try {
      const objectId = req.params.objectId;
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      
      console.log('Starting file upload for objectId:', objectId);
      console.log('Content-Type from header:', contentType);
      
      // Collect the entire request body into a buffer
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on('end', async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          console.log('File buffer size:', fileBuffer.length);
          
          // Simple file type detection based on content-type header
          let extension = '.jpg';
          let mimeType = 'image/jpeg';
          
          if (contentType.includes('image/png')) {
            extension = '.png';
            mimeType = 'image/png';
          } else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
            extension = '.jpg';
            mimeType = 'image/jpeg';
          } else if (contentType.includes('image/gif')) {
            extension = '.gif';
            mimeType = 'image/gif';
          } else if (contentType.includes('image/webp')) {
            extension = '.webp';
            mimeType = 'image/webp';
          }
          
          const filename = `${objectId}${extension}`;
          const filepath = path.join(uploadDir, filename);
          
          console.log('Final file details:', {
            filename,
            extension,
            mimeType,
            size: fileBuffer.length
          });
          
          // Write file to disk
          await fs.promises.writeFile(filepath, fileBuffer);
          
          // Try to save metadata to database, but don't fail if it doesn't work
          try {
            const fileMetadata = {
              objectId,
              originalName: filename,
              mimeType,
              extension,
              filePath: filepath,
              fileSize: fileBuffer.length
            };
            
            await storage.createFileMetadata(fileMetadata);
            console.log('Metadata saved to database successfully');
          } catch (dbError) {
            console.warn('Failed to save metadata to database, but file was saved:', dbError);
            // Continue anyway - the file is saved and can be served
          }
          
          console.log('File uploaded successfully:', filename);
          
          res.json({ 
            success: true, 
            objectPath: `/api/objects/${objectId}/image`,
            filename: filename,
            mimeType,
            extension,
            size: fileBuffer.length
          });
          
        } catch (error) {
          console.error('Error processing file upload:', error);
          res.status(500).json({ error: 'Erro ao processar upload do arquivo' });
        }
      });
      
      req.on('error', (error) => {
        console.error('Error receiving file data:', error);
        res.status(500).json({ error: 'Erro ao receber dados do arquivo' });
      });
      
    } catch (error) {
      console.error('Error in upload endpoint:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Canonical image serving route (before auth setup)
  app.get("/api/objects/:id/image", async (req, res) => {
    try {
      const objectId = req.params.id;
      console.log(`[IMAGE SERVING API] Request for objectId: ${objectId}`);
      console.log(`[IMAGE SERVING API] Headers: ${JSON.stringify(req.headers)}`);
      console.log(`[IMAGE SERVING API] Upload dir: ${uploadDir}`);
      
      // Try to get file metadata from database first
      let metadata: any = null;
      try {
        metadata = await storage.getFileMetadata(objectId);
        console.log('Found file metadata from database:', metadata);
      } catch (dbError) {
        console.warn('Failed to get metadata from database, will try file system:', dbError);
      }
      
      // If no metadata, try to find the file directly
      if (!metadata) {
        console.log('No metadata found, searching for file in upload directory');
        
        // Try common extensions
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        let foundFile = null;
        let foundExtension = null;
        
        for (const ext of extensions) {
          const testPath = path.join(uploadDir, `${objectId}${ext}`);
          if (fs.existsSync(testPath)) {
            foundFile = testPath;
            foundExtension = ext;
            break;
          }
        }
        
        if (foundFile) {
          console.log(`Found file with extension ${foundExtension}: ${foundFile}`);
          
          // Determine MIME type from extension
          let mimeType = 'image/jpeg';
          if (foundExtension === '.png') mimeType = 'image/png';
          else if (foundExtension === '.gif') mimeType = 'image/gif';
          else if (foundExtension === '.webp') mimeType = 'image/webp';
          
          // Set headers and serve file
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
          res.setHeader('ETag', `"${objectId}-${Date.now()}"`);
          
          const fileStream = fs.createReadStream(foundFile);
          fileStream.pipe(res);
          
          fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Erro ao servir arquivo' });
            }
          });
          
          return;
        } else {
          console.log(`[IMAGE SERVING API] File not found in upload directory: ${uploadDir}`);
          console.log(`[IMAGE SERVING API] Checked extensions:`, extensions);
          return res.status(404).json({ error: 'Imagem não encontrada' });
        }
      }
      
      // If we have metadata, use it
      console.log('Using metadata to serve file:', {
        objectId: metadata.objectId,
        mimeType: metadata.mimeType,
        extension: metadata.extension,
        filePath: metadata.filePath
      });
      
      // Resolve file path. Always use the current upload directory
      // The stored metadata might point to an old location, so we reconstruct the path
      const expectedFileName = `${objectId}.${metadata.extension?.replace('.', '') || 'jpg'}`;
      let filePath = path.join(uploadDir, expectedFileName);
      
      if (!fs.existsSync(filePath)) {
        // Try common extensions if the exact file doesn't exist
        const candidates = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
          .map(ext => path.join(uploadDir, `${objectId}${ext}`));
        const existing = candidates.find(p => fs.existsSync(p));
        if (existing) {
          filePath = existing;
          console.log(`[IMAGE SERVING API] Found file with different extension: ${path.basename(existing)}`);
        } else {
          console.log(`[IMAGE SERVING API] File not found in upload directory: ${uploadDir}`);
          console.log(`[IMAGE SERVING API] Expected: ${expectedFileName}, Candidates checked:`, candidates.map(p => path.basename(p)));
          return res.status(404).json({ error: 'Arquivo não encontrado no disco' });
        }
      }
      
      // Set correct Content-Type and serve file
      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.setHeader('ETag', `"${metadata.objectId}-${metadata.updatedAt.getTime()}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro ao servir arquivo' });
        }
      });
      
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Setup authentication
  setupAuth(app);

  // Contact form submission (public)
  app.post("/api/contact", async (req, res) => {
    try {
      console.log("📝 [CONTACT] Received contact form data:", req.body);
      
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      console.log("✅ [CONTACT] Validated data:", validatedData);
      
      const submission = await storage.createContactSubmission(validatedData);
      console.log("💾 [CONTACT] Saved to database:", submission);
      
      res.json({ 
        success: true, 
        message: "Cotação enviada com sucesso! Entraremos em contato em breve." 
      });
    } catch (error) {
      console.error("❌ [CONTACT] Error processing contact form:", error);
      res.status(400).json({ 
        error: "Erro ao processar formulário. Verifique os dados e tente novamente." 
      });
    }
  });

  // ADMIN ROUTES (protected)

  // Contact Submissions Management
  app.get("/api/admin/contact/submissions", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 [ADMIN] Fetching contact submissions...");
      const submissions = await storage.getContactSubmissions();
      console.log(`✅ [ADMIN] Found ${submissions.length} contact submissions`);
      res.json(submissions);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching contact submissions:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Plans Management
  app.get("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 [ADMIN] Fetching all plans...");
      const plans = await storage.getAllPlans();
      console.log(`✅ [ADMIN] Found ${plans.length} plans`);
      res.json(plans);
    } catch (error) {
      console.error("❌ [ADMIN] Error in /api/admin/plans:", error);
      res.status(500).json({ error: "Erro ao buscar planos" });
    }
  });

  app.post("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos para criar plano" });
    }
  });

  app.put("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPlanSchema.partial().parse(req.body);
      const plan = await storage.updatePlan(id, validatedData);
      
      if (!plan) {
        return res.status(404).json({ error: "Plano não encontrado" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos para atualizar plano" });
    }
  });

  app.delete("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePlan(id);
      
      if (!success) {
        return res.status(404).json({ error: "Plano não encontrado" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar plano" });
    }
  });

  // Network Units Management
  app.get("/api/admin/network-units", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 [ADMIN] Fetching all network units...");
      const units = await storage.getAllNetworkUnits();
      console.log(`✅ [ADMIN] Found ${units.length} network units`);
      res.json(units);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching network units:", error);
      res.status(500).json({ error: "Erro ao buscar unidades da rede" });
    }
  });

  app.post("/api/admin/network-units", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNetworkUnitSchema.parse(req.body);
      const unit = await storage.createNetworkUnit(validatedData);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos para criar unidade da rede" });
    }
  });

  app.put("/api/admin/network-units/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertNetworkUnitSchema.partial().parse(req.body);
      const unit = await storage.updateNetworkUnit(id, validatedData);
      
      if (!unit) {
        return res.status(404).json({ error: "Unidade da rede não encontrada" });
      }
      
      res.json(unit);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos para atualizar unidade da rede" });
    }
  });

  app.delete("/api/admin/network-units/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteNetworkUnit(id);
      
      if (!success) {
        return res.status(404).json({ error: "Unidade da rede não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar unidade da rede" });
    }
  });

  // FAQ Items Management
  app.get("/api/admin/faq", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 [ADMIN] Fetching all FAQ items...");
      console.log("🔍 [ADMIN] User authenticated:", req.session.user.username);
      
      const items = await storage.getAllFaqItems();
      console.log(`✅ [ADMIN] Found ${items.length} FAQ items`);
      
      // Garantir que as quebras de linha sejam preservadas na resposta
      const formattedItems = items.map(item => ({
        ...item,
        question: item.question || '',
        answer: item.answer || ''
      }));
      
      res.json(formattedItems);
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching FAQ items:", error);
      console.error("❌ [ADMIN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Erro ao buscar itens do FAQ",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Site Settings Management (Admin only)
  app.get("/api/admin/site-settings", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 [ADMIN] Fetching site settings...");
      const settings = await storage.getSiteSettings();
      console.log(`✅ [ADMIN] Site settings:`, settings ? 'Found' : 'Not found');
      res.json(settings || {});
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching site settings:", error);
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  app.put("/api/admin/site-settings", requireAdmin, async (req, res) => {
    try {
      console.log('🔍 [ADMIN] Received site settings update request');
      console.log('🔍 [ADMIN] Request body:', req.body);
      console.log('🔍 [ADMIN] Image fields:', {
        mainImage: req.body.mainImage,
        networkImage: req.body.networkImage,
        aboutImage: req.body.aboutImage
      });
      
      // Validate the data
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      console.log('🔍 [ADMIN] Validated data:', validatedData);
      
      // Update settings in database
      const settings = await storage.updateSiteSettings(validatedData);
      console.log('🔍 [ADMIN] Updated settings result:', settings);
      
      // Return the updated settings
      res.json(settings);
      
      console.log('🔍 [ADMIN] Site settings updated successfully');
    } catch (error) {
      console.error("🔍 [ADMIN] Error updating site settings:", error);
      res.status(400).json({ error: "Dados inválidos para atualizar configurações" });
    }
  });

  app.post("/api/admin/faq", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 [ADMIN] Creating new FAQ item...");
      console.log("🔍 [ADMIN] User authenticated:", req.session.user.username);
      console.log("🔍 [ADMIN] Request body:", req.body);
      
      // Sanitizar dados preservando quebras de linha
      const sanitizedBody = {
        ...req.body,
        question: sanitizeText(req.body.question),
        answer: sanitizeText(req.body.answer)
      };
      
      const validatedData = insertFaqItemSchema.parse(sanitizedBody);
      const item = await storage.createFaqItem(validatedData);
      console.log("✅ [ADMIN] FAQ item created successfully:", item.id);
      res.json(item);
    } catch (error) {
      console.error("❌ [ADMIN] Error creating FAQ item:", error);
      console.error("❌ [ADMIN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(400).json({ 
        error: "Dados inválidos para criar item do FAQ",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/admin/faq/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("🔍 [ADMIN] Updating FAQ item:", id);
      console.log("🔍 [ADMIN] User authenticated:", req.session.user.username);
      console.log("🔍 [ADMIN] Request body:", req.body);
      
      // Sanitizar dados preservando quebras de linha
      const sanitizedBody = {
        ...req.body,
        question: req.body.question ? sanitizeText(req.body.question) : undefined,
        answer: req.body.answer ? sanitizeText(req.body.answer) : undefined
      };
      
      const validatedData = insertFaqItemSchema.partial().parse(sanitizedBody);
      const item = await storage.updateFaqItem(id, validatedData);
      
      if (!item) {
        console.log("❌ [ADMIN] FAQ item not found:", id);
        return res.status(404).json({ error: "Item do FAQ não encontrado" });
      }
      
      console.log("✅ [ADMIN] FAQ item updated successfully:", id);
      res.json(item);
    } catch (error) {
      console.error("❌ [ADMIN] Error updating FAQ item:", id, error);
      console.error("❌ [ADMIN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(400).json({ 
        error: "Dados inválidos para atualizar item do FAQ",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.delete("/api/admin/faq/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("🔍 [ADMIN] Deleting FAQ item:", id);
      console.log("🔍 [ADMIN] User authenticated:", req.session.user.username);
      
      const success = await storage.deleteFaqItem(id);
      
      if (!success) {
        console.log("❌ [ADMIN] FAQ item not found for deletion:", id);
        return res.status(404).json({ error: "Item do FAQ não encontrado" });
      }
      
      console.log("✅ [ADMIN] FAQ item deleted successfully:", id);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ [ADMIN] Error deleting FAQ item:", id, error);
      console.error("❌ [ADMIN] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Erro ao deletar item do FAQ",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // OBJECT STORAGE ROUTES

  // Serve uploaded images
  app.get("/objects/uploads/:filename", async (req, res) => {
    try {
      const filename = req.params.filename; // may or may not include extension
      let filePath = path.join(uploadDir, filename);
      
      console.log(`[IMAGE SERVING] Request for: ${filename}`);
      console.log(`[IMAGE SERVING] Looking at path: ${filePath}`);
      console.log(`[IMAGE SERVING] Upload dir: ${uploadDir}`);

      let ext = path.extname(filename).toLowerCase();
      if (!fs.existsSync(filePath)) {
        // Try common extensions if none or wrong extension
        const base = path.join(uploadDir, path.basename(filename, ext));
        const candidates = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].map(e => base + e);
        const existing = candidates.find(p => fs.existsSync(p));
        console.log(`[IMAGE SERVING] File not found: ${filePath}. Upload dir: ${uploadDir}, Candidates:`, candidates.map(p => path.basename(p)));
        if (!existing) {
          return res.status(404).json({ error: "File not found" });
        }
        filePath = existing;
        ext = path.extname(existing).toLowerCase();
      }
      
      // Set proper content type
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      console.log(`[IMAGE SERVING] Serving file: ${path.basename(filePath)} as ${contentType}`);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Erro ao servir arquivo" });
    }
  });

  // Legacy object serving route - now handles local storage
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectPath = req.params.objectPath;
      console.log('Legacy object serving route - objectPath:', objectPath);
      
      // Extract filename from path (uploads/filename)
      const pathParts = objectPath.split('/');
      if (pathParts.length >= 2 && pathParts[0] === 'uploads') {
        const filename = pathParts[1];
        const filePath = path.join(uploadDir, filename);
        
        console.log('Looking for file at:', filePath);
        
        if (fs.existsSync(filePath)) {
          console.log('File found, serving:', filename);
          
          // Get file stats for proper headers
          const stats = fs.statSync(filePath);
          const ext = path.extname(filename).toLowerCase();
          
          // Set content type based on extension
          let contentType = 'application/octet-stream';
          if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
          else if (ext === '.png') contentType = 'image/png';
          else if (ext === '.gif') contentType = 'image/gif';
          else if (ext === '.webp') contentType = 'image/webp';
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', stats.size);
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
          
          return res.sendFile(path.resolve(filePath));
        }
      }
      
      // If file not found, return 404
      console.log('File not found for objectPath:', objectPath);
      res.status(404).json({ error: "Objeto não encontrado" });
    } catch (error) {
      console.error("Error serving object:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Update network unit with uploaded image
  app.put("/api/admin/network-units/:id/image", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageURL } = req.body;

      if (!imageURL) {
        return res.status(400).json({ error: "imageURL é obrigatório" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(imageURL);
      
      // Update the network unit with the normalized object path
      const unit = await storage.updateNetworkUnit(id, { imageUrl: objectPath });
      
      if (!unit) {
        return res.status(404).json({ error: "Unidade da rede não encontrada" });
      }
      
      res.json({ objectPath });
    } catch (error) {
      console.error("Error updating network unit image:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // PUBLIC ROUTES (for frontend to consume)
  
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection by counting plans
      const plans = await storage.getPlans();
      res.json({ 
        status: "healthy",
        database: "connected",
        plansCount: plans?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: "unhealthy",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/plans", async (req, res) => {
    try {
      console.log("Attempting to fetch plans from database...");
      const plans = await storage.getPlans();
      console.log("Successfully fetched plans:", plans?.length || 0, "plans");
      
      // If no plans found, return empty array instead of error
      if (!plans || plans.length === 0) {
        console.log("No plans found in database, returning empty array");
        return res.json([]);
      }
      
      res.json(plans);
    } catch (error) {
      console.error("Error in /api/plans:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      
      // Return more specific error information
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("does not exist")) {
        console.log("Database schema issue detected, attempting to initialize...");
        // Return empty array for now, the database initialization will run on next restart
        return res.json([]);
      }
      
      res.status(500).json({ 
        error: "Erro ao buscar planos",
        details: autoConfig.get('NODE_ENV') === 'development' ? errorMessage : undefined
      });
    }
  });

  // Site Settings (public read access)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  app.get("/api/network-units", async (req, res) => {
    try {
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
      console.error("Erro ao buscar unidades da rede:", error);
      res.status(500).json({ error: "Erro ao buscar unidades da rede" });
    }
  });

  app.get("/api/faq", async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      
      // Garantir que as quebras de linha sejam preservadas na resposta
      const formattedItems = items.map(item => ({
        ...item,
        question: item.question || '',
        answer: item.answer || ''
      }));
      
      res.json(formattedItems);
    } catch (error) {
      console.error("Erro detalhado ao buscar FAQ:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      res.status(500).json({ error: "Erro ao buscar itens do FAQ", details: errorMessage, stack: errorStack });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
