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
} from "@shared/schema";
import { db } from "./db.js";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db.js";

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
    const [plan] = await db.select({
      id: plans.id,
      name: plans.name,
      price: plans.price,
      description: plans.description,
      features: plans.features,
      buttonText: plans.buttonText,
      redirectUrl: plans.redirectUrl,
      planType: plans.planType,
      isActive: plans.isActive,
      displayOrder: plans.displayOrder,
      createdAt: plans.createdAt,
    }).from(plans).where(eq(plans.id, id));
    return plan || undefined;
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

export const storage = new DatabaseStorage();