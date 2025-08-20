import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const planTypeEnum = pgEnum('plan_type_enum', ['with_waiting_period', 'without_waiting_period']);

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  petName: text("pet_name").notNull(),
  animalType: text("animal_type").notNull(),
  petAge: text("pet_age").notNull(),
  planInterest: text("plan_interest").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  buttonText: text("button_text").default("Contratar Plano").notNull(),
  redirectUrl: text("redirect_url").default("/contact").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  planType: planTypeEnum("plan_type").default("with_waiting_period").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const networkUnits = pgTable("network_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  googleMapsUrl: text("google_maps_url"),
  rating: integer("rating").notNull(), // stored as 48 for 4.8 rating
  services: text("services").array().notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whatsapp: text("whatsapp"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  cnpj: text("cnpj"),
  businessHours: text("business_hours"),
  ourStory: text("our_story"),
  privacyPolicy: text("privacy_policy"),
  termsOfUse: text("terms_of_use"),
  mainImage: text("main_image"),
  networkImage: text("network_image"),
  aboutImage: text("about_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const fileMetadata = pgTable("file_metadata", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  objectId: varchar("object_id").notNull().unique(),
  originalName: text("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  extension: varchar("extension").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkUnitSchema = createInsertSchema(networkUnits).omit({
  id: true,
  createdAt: true,
}).extend({
  whatsapp: z.string().regex(/^\d{11}$/, "WhatsApp deve conter exatamente 11 dígitos").optional(),
  googleMapsUrl: z.string().url("URL do Google Maps deve ser válida").optional(),
});

export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileMetadataSchema = createInsertSchema(fileMetadata).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertNetworkUnit = z.infer<typeof insertNetworkUnitSchema>;
export type NetworkUnit = typeof networkUnits.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type FaqItem = typeof faqItems.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertFileMetadata = z.infer<typeof insertFileMetadataSchema>;
export type FileMetadata = typeof fileMetadata.$inferSelect;

// Admin user type for session management (no database table)
export interface AdminUser {
  id: string;
  username: string;
  createdAt: Date;
}
