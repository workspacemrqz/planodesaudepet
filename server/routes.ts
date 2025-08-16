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
import { setupAuth, initializeAdminUser } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
      
      // Return a mock upload URL that points to our local upload endpoint
      const uploadURL = `http://localhost:3005/api/objects/upload-file/${objectId}`;
      
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

  // Setup authentication
  setupAuth(app);

  // Initialize default admin user
  await initializeAdminUser();

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
      const filename = req.params.filename;
      const filePath = path.join(uploadDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Erro ao servir arquivo" });
    }
  });

  // Legacy object serving route
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
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
