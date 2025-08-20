import { 
  type User, 
  type InsertUser, 
  type ContactSubmission, 
  type InsertContactSubmission,
  type Plan,
  type InsertPlan,
  type NetworkUnit,
  type InsertNetworkUnit,
  type FaqItem,
  type InsertFaqItem,
  type AdminUser,
  type InsertAdminUser,
  type SiteSettings,
  type InsertSiteSettings,
  type FileMetadata,
  type InsertFileMetadata,
  users,
  contactSubmissions,
  plans,
  networkUnits,
  faqItems,
  adminUsers,
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
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  
  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  // Plans
  getPlans(): Promise<Plan[]>;
  getAllPlans(): Promise<Plan[]>; // For admin - includes inactive plans
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;
  
  // Network Units
  getNetworkUnits(): Promise<NetworkUnit[]>;
  getNetworkUnit(id: string): Promise<NetworkUnit | undefined>;
  createNetworkUnit(unit: InsertNetworkUnit): Promise<NetworkUnit>;
  updateNetworkUnit(id: string, unit: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined>;
  deleteNetworkUnit(id: string): Promise<boolean>;
  
  // FAQ Items
  getFaqItems(): Promise<FaqItem[]>;
  getFaqItem(id: string): Promise<FaqItem | undefined>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: string, item: Partial<InsertFaqItem>): Promise<FaqItem | undefined>;
  deleteFaqItem(id: string): Promise<boolean>;
  
  // Site Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined>;
  
  // File Metadata
  getFileMetadata(objectId: string): Promise<FileMetadata | undefined>;
  createFileMetadata(metadata: InsertFileMetadata): Promise<FileMetadata>;
  updateFileMetadata(objectId: string, metadata: Partial<InsertFileMetadata>): Promise<FileMetadata | undefined>;
  deleteFileMetadata(objectId: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(insertAdminUser).returning();
    return user;
  }

  // Contact Submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db.insert(contactSubmissions).values(insertSubmission).returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    try {
      console.log("Executing getPlans query...");
      const result = await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.displayOrder));
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
      const result = await db.select().from(plans).orderBy(asc(plans.displayOrder));
      console.log("All plans query result:", result);
      return result;
    } catch (error) {
      console.error("Error in getAllPlans:", error);
      throw error;
    }
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(insertPlan).returning();
    return plan;
  }

  async updatePlan(id: string, updateData: Partial<InsertPlan>): Promise<Plan | undefined> {
    const [plan] = await db.update(plans).set(updateData).where(eq(plans.id, id)).returning();
    return plan || undefined;
  }

  async deletePlan(id: string): Promise<boolean> {
    const result = await db.update(plans).set({ isActive: false }).where(eq(plans.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Network Units
  async getNetworkUnits(): Promise<NetworkUnit[]> {
    return await db.select().from(networkUnits).where(eq(networkUnits.isActive, true));
  }

  async getNetworkUnit(id: string): Promise<NetworkUnit | undefined> {
    const [unit] = await db.select().from(networkUnits).where(eq(networkUnits.id, id));
    return unit || undefined;
  }

  async createNetworkUnit(insertUnit: InsertNetworkUnit): Promise<NetworkUnit> {
    const [unit] = await db.insert(networkUnits).values(insertUnit).returning();
    return unit;
  }

  async updateNetworkUnit(id: string, updateData: Partial<InsertNetworkUnit>): Promise<NetworkUnit | undefined> {
    const [unit] = await db.update(networkUnits).set(updateData).where(eq(networkUnits.id, id)).returning();
    return unit || undefined;
  }

  async deleteNetworkUnit(id: string): Promise<boolean> {
    const result = await db.update(networkUnits).set({ isActive: false }).where(eq(networkUnits.id, id));
    return (result.rowCount || 0) > 0;
  }

  // FAQ Items
  async getFaqItems(): Promise<FaqItem[]> {
    return await db.select().from(faqItems).where(eq(faqItems.isActive, true)).orderBy(asc(faqItems.displayOrder));
  }

  async getFaqItem(id: string): Promise<FaqItem | undefined> {
    const [item] = await db.select().from(faqItems).where(eq(faqItems.id, id));
    return item || undefined;
  }

  async createFaqItem(insertItem: InsertFaqItem): Promise<FaqItem> {
    const [item] = await db.insert(faqItems).values(insertItem).returning();
    return item;
  }

  async updateFaqItem(id: string, updateData: Partial<InsertFaqItem>): Promise<FaqItem | undefined> {
    const [item] = await db.update(faqItems).set(updateData).where(eq(faqItems.id, id)).returning();
    return item || undefined;
  }

  async deleteFaqItem(id: string): Promise<boolean> {
    const result = await db.update(faqItems).set({ isActive: false }).where(eq(faqItems.id, id));
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

  async createFileMetadata(insertMetadata: InsertFileMetadata): Promise<FileMetadata> {
    const [metadata] = await db.insert(fileMetadata).values(insertMetadata).returning();
    return metadata;
  }

  async updateFileMetadata(objectId: string, updateData: Partial<InsertFileMetadata>): Promise<FileMetadata | undefined> {
    const [metadata] = await db.update(fileMetadata)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(fileMetadata.objectId, objectId))
      .returning();
    return metadata || undefined;
  }

  async deleteFileMetadata(objectId: string): Promise<boolean> {
    const result = await db.delete(fileMetadata).where(eq(fileMetadata.objectId, objectId));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
