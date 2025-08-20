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
import { setupAuth, validateAdminCredentials } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";

// Configure multer for file uploads
// In production, use a persistent directory that survives deploys
// Use persistent storage in production (Easypanel/Docker)
const uploadDir = process.env.NODE_ENV === 'production' 
  ? (process.env.UPLOADS_DIR || '/data/uploads')
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created upload directory:', uploadDir);
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
  console.log('requireAdmin middleware - isAuthenticated:', req.isAuthenticated());
  console.log('requireAdmin middleware - user:', req.user);
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
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
          
          // Detect file type using magic bytes
          const detectedType = await fileTypeFromBuffer(fileBuffer);
          console.log('Detected file type:', detectedType);
          
          if (!detectedType || !detectedType.mime.startsWith('image/')) {
            return res.status(400).json({ error: 'Arquivo não é uma imagem válida' });
          }
          
          const extension = `.${detectedType.ext}`;
          const mimeType = detectedType.mime;
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
          
          // Save metadata to database
          const fileMetadata = {
            objectId,
            originalName: filename,
            mimeType,
            extension,
            filePath: filepath,
            fileSize: fileBuffer.length
          };
          
          await storage.createFileMetadata(fileMetadata);
          
          console.log('File uploaded and metadata saved successfully:', filename);
          
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
      console.error('Error in file upload:', error);
      res.status(500).json({ error: 'Erro no upload do arquivo' });
    }
  });

  // Canonical image serving route (before auth setup)
  app.get("/api/objects/:id/image", async (req, res) => {
    try {
      const objectId = req.params.id;
      console.log(`[IMAGE SERVING API] Request for objectId: ${objectId}`);
      console.log(`[IMAGE SERVING API] Headers: ${JSON.stringify(req.headers)}`);
      console.log(`[IMAGE SERVING API] Upload dir: ${uploadDir}`);
      
      // Get file metadata from database
      const metadata = await storage.getFileMetadata(objectId);
      
      if (!metadata) {
        console.log('File metadata not found for objectId:', objectId);
        return res.status(404).json({ error: 'Imagem não encontrada' });
      }
      
      console.log('Found file metadata:', {
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

  // Initialize default admin user
  await validateAdminCredentials();

  // Contact form submission (public)
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      console.log("New contact submission:", submission);
      
      res.json({ 
        success: true, 
        message: "Cotação enviada com sucesso! Entraremos em contato em breve." 
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(400).json({ 
        error: "Erro ao processar formulário. Verifique os dados e tente novamente." 
      });
    }
  });

  // ADMIN ROUTES (protected)

  // Contact Submissions Management
  app.get("/api/admin/contact/submissions", requireAdmin, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Plans Management
  app.get("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
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
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
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
      const items = await storage.getFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar itens do FAQ" });
    }
  });

  // Site Settings Management (Admin only)
  app.get("/api/admin/site-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  });

  app.put("/api/admin/site-settings", requireAdmin, async (req, res) => {
    try {
      console.log('Received site settings data:', req.body);
      console.log('Image fields:', {
        mainImage: req.body.mainImage,
        networkImage: req.body.networkImage,
        aboutImage: req.body.aboutImage
      });
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      console.log('Validated data:', validatedData);
      const settings = await storage.updateSiteSettings(validatedData);
      console.log('Updated settings result:', settings);
      res.json(settings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(400).json({ error: "Dados inválidos para atualizar configurações" });
    }
  });

  app.post("/api/admin/faq", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertFaqItemSchema.parse(req.body);
      const item = await storage.createFaqItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos para criar item do FAQ" });
    }
  });

  app.put("/api/admin/faq/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFaqItemSchema.partial().parse(req.body);
      const item = await storage.updateFaqItem(id, validatedData);
      
      if (!item) {
        return res.status(404).json({ error: "Item do FAQ não encontrado" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Dados inválidos para atualizar item do FAQ" });
    }
  });

  app.delete("/api/admin/faq/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteFaqItem(id);
      
      if (!success) {
        return res.status(404).json({ error: "Item do FAQ não encontrado" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar item do FAQ" });
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

  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar planos" });
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
      res.json(items);
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
