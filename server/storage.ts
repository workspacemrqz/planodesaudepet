import { 
  type ContactSubmission, 
  type InsertContactSubmission,
  type Plan,
  type InsertPlan,
  type NetworkUnit,
  type InsertNetworkUnit,
  type FaqItem,
  type InsertFaqItem,
  type SiteSettings,
  type InsertSiteSettings,
  contactSubmissions,
  plans,
  networkUnits,
  faqItems,
  siteSettings
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db.js";
import { autoConfig } from "./config.js";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  deleteContactSubmission(id: string): Promise<boolean>;
  
  // Plans
  getPlans(): Promise<Plan[]>;
  getAllPlans(): Promise<Plan[]>; // For admin - includes inactive plans
  getAllActivePlans(): Promise<Plan[]>; // For public API
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined>;

  deletePlan(id: string): Promise<boolean>;
  
  // Network Units
  getNetworkUnits(): Promise<NetworkUnit[]>;
  getAllNetworkUnits(): Promise<NetworkUnit[]>; // For admin
  getAllActiveNetworkUnits(): Promise<NetworkUnit[]>; // For public API
  getNetworkUnit(id: string): Promise<NetworkUnit | undefined>;
  createNetworkUnit(unit: InsertNetworkUnit): Promise<NetworkUnit>;
  updateNetworkUnit(id: string, unit: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined>;
  deleteNetworkUnit(id: string): Promise<boolean>;
  
  // FAQ Items
  getFaqItems(): Promise<FaqItem[]>;
  getAllFaqItems(): Promise<FaqItem[]>; // For admin
  getFaqItem(id: string): Promise<FaqItem | undefined>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: string, item: Partial<InsertFaqItem>): Promise<FaqItem | undefined>;
  deleteFaqItem(id: string): Promise<boolean>;
  
  // Site Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined>;
}

// Storage em memória para quando não houver banco de dados
export class InMemoryStorage implements IStorage {
  private contactSubmissions: ContactSubmission[] = [];
  private plans: Plan[] = [];
  private networkUnits: NetworkUnit[] = [];
  private faqItems: FaqItem[] = [];
  private siteSettings: SiteSettings | undefined;

  constructor() {
    // Dados de exemplo para desenvolvimento
    this.plans = [
      {
        id: "1",
        name: "Plano Básico",
        price: 2000,
        description: "Cobertura básica para seu pet",
        features: ["Consultas", "Vacinas", "Exames básicos"],
        image: "/BASICicon.svg", // Adicionar imagem do plano
        buttonText: "Contratar Plano",
        redirectUrl: "/contact",
        displayOrder: 1,
        isActive: true,
        planType: "with_waiting_period",
        createdAt: new Date()
      }
    ];

    this.siteSettings = {
      id: "1",
      whatsapp: "+55 (11) 91234-5678",
      email: "contato@unipetplan.com.br",
      phone: "+55 (11) 1234-5678",
      address: "AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI",
      cnpj: "00.000.000/0001-00",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
      businessHours: "",
      ourStory: "",
      privacyPolicy: "",
      termsOfUse: "",
      mainImage: "",
      networkImage: "",
      aboutImage: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Implementação dos métodos da interface
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const newSubmission: ContactSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      city: submission.city,
      petName: submission.petName,
      animalType: submission.animalType,
      petAge: submission.petAge,
      planInterest: submission.planInterest,
      message: submission.message || "",
      createdAt: new Date()
    };
    this.contactSubmissions.push(newSubmission);
    return newSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return this.contactSubmissions;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return this.contactSubmissions;
  }

  async deleteContactSubmission(id: string): Promise<boolean> {
    const index = this.contactSubmissions.findIndex(s => s.id === id);
    if (index > -1) {
      this.contactSubmissions.splice(index, 1);
      return true;
    }
    return false;
  }

  async getPlans(): Promise<Plan[]> {
    return this.plans.filter(p => p.isActive);
  }

  async getAllPlans(): Promise<Plan[]> {
    return this.plans;
  }

  async getAllActivePlans(): Promise<Plan[]> {
    return this.plans.filter(p => p.isActive);
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    return this.plans.find(p => p.id === id);
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const newPlan: Plan = {
      id: Math.random().toString(36).substr(2, 9),
      name: plan.name,
      description: plan.description,
      features: plan.features,
      image: plan.image, // Adicionar campo image
      isActive: plan.isActive,
      buttonText: plan.buttonText,
      redirectUrl: plan.redirectUrl,
      displayOrder: plan.displayOrder,
      price: plan.price,
      planType: plan.planType,
      createdAt: new Date()
    };
    this.plans.push(newPlan);
    return newPlan;
  }

  async updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined> {
    const index = this.plans.findIndex(p => p.id === id);
    if (index > -1) {
      this.plans[index] = { ...this.plans[index], ...plan };
      return this.plans[index];
    }
    return undefined;
  }



  async deletePlan(id: string): Promise<boolean> {
    const index = this.plans.findIndex(p => p.id === id);
    if (index > -1) {
      this.plans.splice(index, 1);
      return true;
    }
    return false;
  }

  async getNetworkUnits(): Promise<NetworkUnit[]> {
    return this.networkUnits.filter(u => u.isActive);
  }

  async getAllNetworkUnits(): Promise<NetworkUnit[]> {
    return this.networkUnits;
  }

  async getAllActiveNetworkUnits(): Promise<NetworkUnit[]> {
    return this.networkUnits.filter(u => u.isActive);
  }

  async getNetworkUnit(id: string): Promise<NetworkUnit | undefined> {
    return this.networkUnits.find(u => u.id === id);
  }

  async createNetworkUnit(unit: InsertNetworkUnit): Promise<NetworkUnit> {
    const newUnit: NetworkUnit = {
      id: Math.random().toString(36).substr(2, 9),
      name: unit.name,
      phone: unit.phone,
      isActive: unit.isActive,
      address: unit.address,
      rating: unit.rating,
      services: unit.services,
      imageUrl: unit.imageUrl,
      whatsapp: unit.whatsapp || "",
      googleMapsUrl: unit.googleMapsUrl || "",
      createdAt: new Date()
    };
    this.networkUnits.push(newUnit);
    return newUnit;
  }

  async updateNetworkUnit(id: string, unit: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    const index = this.networkUnits.findIndex(u => u.id === id);
    if (index > -1) {
      this.networkUnits[index] = { ...this.networkUnits[index], ...unit };
      return this.networkUnits[index];
    }
    return undefined;
  }

  async deleteNetworkUnit(id: string): Promise<boolean> {
    const index = this.networkUnits.findIndex(u => u.id === id);
    if (index > -1) {
      this.networkUnits.splice(index, 1);
      return true;
    }
    return false;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    return this.faqItems.filter(f => f.isActive);
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return this.faqItems;
  }

  async getFaqItem(id: string): Promise<FaqItem | undefined> {
    return this.faqItems.find(f => f.id === id);
  }

  async createFaqItem(item: InsertFaqItem): Promise<FaqItem> {
    const newItem: FaqItem = {
      id: Math.random().toString(36).substr(2, 9),
      isActive: item.isActive,
      displayOrder: item.displayOrder,
      question: item.question,
      answer: item.answer,
      createdAt: new Date()
    };
    this.faqItems.push(newItem);
    return newItem;
  }

  async updateFaqItem(id: string, item: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    const index = this.faqItems.findIndex(f => f.id === id);
    if (index > -1) {
      this.faqItems[index] = { ...this.faqItems[index], ...item };
      return this.faqItems[index];
    }
    return undefined;
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    const index = this.faqItems.findIndex(f => f.id === id);
    if (index > -1) {
      this.faqItems.splice(index, 1);
      return true;
    }
    return false;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    return this.siteSettings;
  }

  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    if (this.siteSettings) {
      this.siteSettings = { ...this.siteSettings, ...settings, updatedAt: new Date() };
      return this.siteSettings;
    }
    return undefined;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // Contact Submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db.insert(contactSubmissions).values(insertSubmission as any).returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async deleteContactSubmission(id: string): Promise<boolean> {
    const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    try {
      console.log("Executing getPlans query...");
      const result = await db.select({
        id: plans.id,
        name: plans.name,
        price: plans.price,
        description: plans.description,
        features: plans.features,
        image: plans.image,
        buttonText: plans.buttonText,
        redirectUrl: plans.redirectUrl,
        planType: plans.planType,
        isActive: plans.isActive,
        displayOrder: plans.displayOrder,
        createdAt: plans.createdAt,
      }).from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.displayOrder));
      
      console.log("Plans query result:", result);
      return result;
    } catch (error) {
      console.error("Error in getPlans:", error);
      throw error;
    }
  }

  async getAllPlans(): Promise<Plan[]> {
    try {
      console.log("Executing getAllPlans query (admin)...");
      const result = await db.select({
        id: plans.id,
        name: plans.name,
        price: plans.price,
        description: plans.description,
        features: plans.features,
        image: plans.image,
        buttonText: plans.buttonText,
        redirectUrl: plans.redirectUrl,
        planType: plans.planType,
        isActive: plans.isActive,
        displayOrder: plans.displayOrder,
        createdAt: plans.createdAt,
      }).from(plans).orderBy(asc(plans.displayOrder));
      
      console.log("All plans query result:", result);
      return result;
    } catch (error) {
      console.error("Error in getAllPlans:", error);
      throw error;
    }
  }

  async getAllActivePlans(): Promise<Plan[]> {
    return await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.displayOrder));
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    try {
      const [plan] = await db.select({
        id: plans.id,
        name: plans.name,
        price: plans.price,
        description: plans.description,
        features: plans.features,
        image: plans.image,
        buttonText: plans.buttonText,
        redirectUrl: plans.redirectUrl,
        planType: plans.planType,
        isActive: plans.isActive,
        displayOrder: plans.displayOrder,
        createdAt: plans.createdAt,
      }).from(plans).where(eq(plans.id, id));
      
      return plan || undefined;
    } catch (error) {
      console.error("Error in getPlan:", error);
      throw error;
    }
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(insertPlan as any).returning();
    return plan;
  }

  async updatePlan(id: string, updateData: Partial<InsertPlan>): Promise<Plan | undefined> {
    const [plan] = await db.update(plans).set(updateData).where(eq(plans.id, id)).returning();
    return plan || undefined;
  }



  async deletePlan(id: string): Promise<boolean> {
    const result = await db.delete(plans).where(eq(plans.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Network Units
  async getNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true));
  }

  async getAllNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(networkUnits).orderBy(desc(networkUnits.createdAt));
  }

  async getAllActiveNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true)).orderBy(desc(networkUnits.createdAt));
  }

  async getNetworkUnit(id: string): Promise<NetworkUnit | undefined> {
    const [unit] = await db.select().from(networkUnits).where(eq(networkUnits.id, id));
    return unit || undefined;
  }

  async createNetworkUnit(insertUnit: InsertNetworkUnit): Promise<NetworkUnit> {
    const [unit] = await db.insert(networkUnits).values(insertUnit as any).returning();
    return unit;
  }

  async updateNetworkUnit(id: string, updateData: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }
    const [unit] = await db.update(networkUnits).set(updateData).where(eq(networkUnits.id, id)).returning();
    return unit || undefined;
  }

  async deleteNetworkUnit(id: string): Promise<boolean> {
    const result = await db.delete(networkUnits).where(eq(networkUnits.id, id));
    return (result.rowCount || 0) > 0;
  }

  // FAQ Items
  async getFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.displayOrder));
  }

  async getAllFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).orderBy(asc(faqItems.displayOrder));
  }

  async getFaqItem(id: string): Promise<FaqItem | undefined> {
    const [item] = await db.select().from(faqItems).where(eq(faqItems.id, id));
    return item || undefined;
  }

  async createFaqItem(insertItem: InsertFaqItem): Promise<FaqItem> {
    const [item] = await db.insert(faqItems).values(insertItem as any).returning();
    return item;
  }

  async updateFaqItem(id: string, updateData: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }
    const [item] = await db.update(faqItems).set(updateData).where(eq(faqItems.id, id)).returning();
    return item || undefined;
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    const result = await db.delete(faqItems).where(eq(faqItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings || undefined;
  }

  async updateSiteSettings(updateData: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }
    
    const existingSettings = await this.getSiteSettings();
    
    if (existingSettings) {
      const [settings] = await db.update(siteSettings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(siteSettings.id, existingSettings.id))
        .returning();
      return settings || undefined;
    } else {
      const [settings] = await db.insert(siteSettings)
        .values({ ...updateData, createdAt: new Date(), updatedAt: new Date() })
        .returning();
      return settings;
    }
  }
}

// Usar storage em memória se não houver banco de dados configurado
export const storage = autoConfig.get('DATABASE_URL') 
  ? new DatabaseStorage() 
  : new InMemoryStorage();