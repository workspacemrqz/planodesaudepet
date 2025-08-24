import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertContactSubmissionSchema, 
  insertPlanSchema, 
  insertNetworkUnitSchema, 
  insertFaqItemSchema,
  insertSiteSettingsSchema,
  type InsertNetworkUnit,
  type InsertSiteSettings
} from "../shared/schema.js";
import { sanitizeText } from "./utils/text-sanitizer.js";
import { setupAuth, requireAuth } from "./auth.js";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage.js";
import { imageServiceBase64 } from "./image-service-base64.js";
import express from "express";

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
  // REMOVIDO - Sistema Base64 não precisa de arquivos estáticos

  // HEALTH CHECK ROUTE
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // NOVO SISTEMA DE IMAGENS BASE64

  // Rota para servir imagens Base64
  app.get("/api/images/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      
      if (type === 'network') {
        // Buscar imagem de network unit
        const networkUnit = await storage.getNetworkUnit(id);
        if (!networkUnit || !networkUnit.imageUrl) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        // Extrair informações do Base64
        const imageInfo = imageServiceBase64.getBase64Info(networkUnit.imageUrl);
        if (!imageInfo) {
          return res.status(400).json({ error: 'Invalid image data' });
        }
        
        // Decodificar Base64 e servir
        const base64Data = networkUnit.imageUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        res.setHeader('Content-Type', imageInfo.mimeType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
        res.send(imageBuffer);
        
      } else if (['main', 'network', 'about'].includes(type)) {
        // Buscar imagem de site settings
        const siteSettings = await storage.getSiteSettings();
        if (!siteSettings) {
          return res.status(404).json({ error: 'Site settings not found' });
        }
        
        let imageUrl;
        if (type === 'main') imageUrl = siteSettings.mainImage;
        else if (type === 'network') imageUrl = siteSettings.networkImage;
        else if (type === 'about') imageUrl = siteSettings.aboutImage;
        
        if (!imageUrl) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        // Extrair informações do Base64
        const imageInfo = imageServiceBase64.getBase64Info(imageUrl);
        if (!imageInfo) {
          return res.status(400).json({ error: 'Invalid image data' });
        }
        
        // Decodificar Base64 e servir
        const base64Data = imageUrl.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        res.setHeader('Content-Type', imageInfo.mimeType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
        res.send(imageBuffer);
        
      } else {
        return res.status(400).json({ error: 'Invalid image type' });
      }
      
    } catch (error) {
      console.error('❌ Error serving image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Rota para upload de imagens
  app.post("/api/images/upload/:type/:id", requireAuth, async (req, res) => {
    try {
      const { type, id } = req.params;
      
      // Configurar multer para este upload
      const upload = imageServiceBase64.getUploadMiddleware().single('image');
      
      upload(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        
        if (!(req as any).file) {
          return res.status(400).json({ error: 'No image file provided' });
        }
        
        try {
          // Processar imagem para Base64
          const result = await imageServiceBase64.processImageToBase64((req as any).file.buffer, {
            width: 800,
            height: 600,
            quality: 80,
            format: 'jpeg'
          });
          
          if (!result.success) {
            return res.status(500).json({ error: result.error });
          }
          
          // Salvar no banco de dados
          if (type === 'network') {
            await storage.updateNetworkUnit(id, { imageUrl: result.base64 });
          } else if (['main', 'network', 'about'].includes(type)) {
            let updateData: Partial<InsertSiteSettings> = {};
            if (type === 'main') updateData = { mainImage: result.base64 };
            else if (type === 'network') updateData = { networkImage: result.base64 };
            else if (type === 'about') updateData = { aboutImage: result.base64 };
            await storage.updateSiteSettings(updateData);
          } else {
            return res.status(400).json({ error: 'Invalid image type' });
          }
          
          res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageInfo: {
              size: result.size,
              format: result.format,
              dimensions: result.dimensions
            }
          });
          
        } catch (error) {
          console.error('❌ Error processing image:', error);
          res.status(500).json({ error: 'Error processing image' });
        }
      });
      
    } catch (error) {
      console.error('❌ Error in upload route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Rota para deletar imagens
  app.delete("/api/images/:type/:id", requireAuth, async (req, res) => {
    try {
      const { type, id } = req.params;
      
      if (type === 'network') {
        await storage.updateNetworkUnit(id, { imageUrl: undefined });
      } else if (['main', 'network', 'about'].includes(type)) {
        let updateData: Partial<InsertSiteSettings> = {};
        if (type === 'main') updateData = { mainImage: undefined };
        else if (type === 'network') updateData = { networkImage: undefined };
        else if (type === 'about') updateData = { aboutImage: undefined };
        await storage.updateSiteSettings(updateData);
      } else {
        return res.status(400).json({ error: 'Invalid image type' });
      }
      
      res.json({ success: true, message: 'Image deleted successfully' });
      
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Diagnostic endpoint for production debugging
  app.get('/api/diagnostic', (req, res) => {
    res.json({
      status: 'ok',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '8080',
        DATABASE_URL: process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT CONFIGURED',
        ADMIN_AUTH: process.env.LOGIN && process.env.SENHA ? 'CONFIGURED' : 'NOT CONFIGURED',
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // REMOVIDO: Rotas deprecated de /api/objects/* completamente removidas
  
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
      console.log("🔍 [ADMIN] User authenticated:", req.session.user?.username);
      
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
      console.log("🔍 [ADMIN] User authenticated:", req.session.user?.username);
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
    const { id } = req.params;
    try {
      console.log("🔍 [ADMIN] Updating FAQ item:", id);
      console.log("🔍 [ADMIN] User authenticated:", req.session.user?.username);
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
    const { id } = req.params;
    try {
      console.log("🔍 [ADMIN] Deleting FAQ item:", id);
      console.log("🔍 [ADMIN] User authenticated:", req.session.user?.username);
      
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

  // OBJECT STORAGE ROUTES - REMOVIDO SISTEMA ANTIGO

  // Update network unit with uploaded image
  app.put("/api/admin/network-units/:id/image", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body; // Agora recebe Base64 diretamente

      if (!imageUrl) {
        return res.status(400).json({ error: "Image data is required" });
      }

      // Validar Base64
      if (!imageServiceBase64.validateBase64(imageUrl)) {
        return res.status(400).json({ error: "Invalid image data format" });
      }

      // Atualizar no banco
      await storage.updateNetworkUnit(id, { imageUrl: imageUrl });
      
      res.json({ success: true, message: "Network unit image updated successfully" });
    } catch (error) {
      console.error("❌ Error updating network unit image:", error);
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
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
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
