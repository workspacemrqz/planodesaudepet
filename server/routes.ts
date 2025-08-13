import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertPlanSchema, 
  insertNetworkUnitSchema, 
  insertFaqItemSchema 
} from "@shared/schema";
import { setupAuth, initializeAdminUser } from "./auth";

// Middleware to check admin authentication
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
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

  // PUBLIC ROUTES (for frontend to consume)

  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar planos" });
    }
  });

  app.get("/api/network-units", async (req, res) => {
    try {
      const units = await storage.getNetworkUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar unidades da rede" });
    }
  });

  app.get("/api/faq", async (req, res) => {
    try {
      const items = await storage.getFaqItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar itens do FAQ" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
