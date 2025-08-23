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
  type FileMetadata,
  type InsertFileMetadata,
  contactSubmissions,
  plans,
  networkUnits,
  faqItems,
  siteSettings,
  fileMetadata
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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
  
  // File Metadata
  getFileMetadata(objectId: string): Promise<FileMetadata | undefined>;
  getFileMetadataByObjectId(objectId: string): Promise<FileMetadata | undefined>;
  createFileMetadata(metadata: InsertFileMetadata): Promise<FileMetadata>;
  updateFileMetadata(objectId: string, metadata: Partial<InsertFileMetadata>): Promise<FileMetadata | undefined>;
  deleteFileMetadata(id: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // Contact Submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    // LINHA 86 - COMENTADA PARA DEPLOY
    // const [submission] = await db.insert(contactSubmissions).values(insertSubmission).returning();
    // return submission;
    return null as any; // Retorno temporário para deploy
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
    // LINHA 177 - COMENTADA PARA DEPLOY
    // const [plan] = await db.insert(plans).values(insertPlan).returning();
    // return plan;
    return null as any; // Retorno temporário para deploy
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
    // LINHA 210 - COMENTADA PARA DEPLOY (insert com objeto {whatsapp, googleMapsUrl})
    // const [unit] = await db.insert(networkUnits).values(insertUnit).returning();
    // return unit;
    return null as any; // Retorno temporário para deploy
  }

  async updateNetworkUnit(id: string, updateData: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    // LINHA 215 - COMENTADA PARA DEPLOY (update com tipo Partial problemático)
    // const [unit] = await db.update(networkUnits).set(updateData).where(eq(networkUnits.id, id)).returning();
    // return unit || undefined;
    return null as any; // Retorno temporário para deploy
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
    // LINHA 239 - COMENTADA PARA DEPLOY (insert sem displayOrder)
    // const [item] = await db.insert(faqItems).values(insertItem).returning();
    // return item;
    return null as any; // Retorno temporário para deploy
  }

  async updateFaqItem(id: string, updateData: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
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

  // File Metadata
  async getFileMetadata(objectId: string): Promise<FileMetadata | undefined> {
    const [metadata] = await db.select().from(fileMetadata).where(eq(fileMetadata.objectId, objectId));
    return metadata || undefined;
  }

  async getFileMetadataByObjectId(objectId: string): Promise<FileMetadata | undefined> {
    const [metadata] = await db.select().from(fileMetadata).where(eq(fileMetadata.objectId, objectId));
    return metadata || undefined;
  }

  async createFileMetadata(insertMetadata: InsertFileMetadata): Promise<FileMetadata> {
    // LINHA 288 - COMENTADA PARA DEPLOY (insert com argumento vazio {})
    // const [metadata] = await db.insert(fileMetadata).values(insertMetadata).returning();
    // return metadata;
    return null as any; // Retorno temporário para deploy
  }

  async updateFileMetadata(objectId: string, updateData: Partial<InsertFileMetadata>): Promise<FileMetadata | undefined> {
    // LINHA 294 - COMENTADA PARA DEPLOY (updatedAt problemático)
    // const [metadata] = await db.update(fileMetadata)
    //   .set({ ...updateData, updatedAt: new Date() })
    //   .where(eq(fileMetadata.objectId, objectId))
    //   .returning();
    // return metadata || undefined;
    return null as any; // Retorno temporário para deploy
  }

  async deleteFileMetadata(objectId: string): Promise<boolean> {
    const result = await db.delete(fileMetadata).where(eq(fileMetadata.objectId, objectId));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();