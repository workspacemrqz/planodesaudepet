import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";

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

export const planTypeEnum = pgEnum("plan_type_enum", ["with_waiting_period", "without_waiting_period"]);

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  buttonText: text("button_text").default("Contratar Plano").notNull(),
  redirectUrl: text("redirect_url").default("/contact").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  price: integer("price").default(0).notNull(),
  planType: planTypeEnum("plan_type").default("with_waiting_period").notNull(),
});

export const networkUnits = pgTable("network_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  rating: integer("rating").notNull(),
  services: text("services").array().notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  whatsapp: text("whatsapp"),
  googleMapsUrl: text("google_maps_url"),
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
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  cnpj: text("cnpj"),
  businessHours: text("business_hours"),
  ourStory: text("our_story"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  privacyPolicy: text("privacy_policy"),
  termsOfUse: text("terms_of_use"),
  address: text("address"),
  mainImage: text("main_image"),
  networkImage: text("network_image"),
  aboutImage: text("about_image"),
});

export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Tabela file_metadata que existe no banco mas não estava no código
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

// Tabelas para a área do cliente
export const clientes = pgTable("clientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  cpf: varchar("cpf").notNull().unique(),
  email: text("email").notNull().unique(),
  telefone: text("telefone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const planosClientes = pgTable("planos_clientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clienteId: varchar("cliente_id").notNull().references(() => clientes.id),
  planoId: varchar("plano_id").notNull().references(() => plans.id),
  numeroApolice: varchar("numero_apolice").notNull().unique(),
  mensalidade: integer("mensalidade").notNull(),
  vencimento: integer("vencimento").notNull(),
  formaPagamento: text("forma_pagamento").notNull(),
  coparticipacao: text("coparticipacao").notNull(),
  status: text("status").default("ativo").notNull(),
  dataInicio: timestamp("data_inicio").notNull(),
  dataFim: timestamp("data_fim"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const beneficiosPlanos = pgTable("beneficios_planos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planoId: varchar("plano_id").notNull().references(() => plans.id),
  tipoBeneficio: text("tipo_beneficio").notNull(),
  carencia: text("carencia").notNull(),
  descricao: text("descricao").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const informacoesContato = pgTable("informacoes_contato", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  atendimento: text("atendimento").notNull(),
  app: text("app").notNull(),
  site: text("site").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SCHEMAS DE INSERÇÃO CORRIGIDOS PARA CORRESPONDER AO BANCO
export const insertContactSubmissionSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  city: z.string(),
  petName: z.string(),
  animalType: z.string(),
  petAge: z.string(),
  planInterest: z.string(),
  message: z.string().optional(),
});

export const insertPlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  buttonText: z.string().default("Contratar Plano"),
  redirectUrl: z.string().default("/contact"),
  displayOrder: z.number().default(0),
  price: z.number().default(0),
  planType: z.enum(["with_waiting_period", "without_waiting_period"]).default("with_waiting_period"),
});

export const insertNetworkUnitSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  rating: z.number(),
  services: z.array(z.string()),
  imageUrl: z.string(),
  isActive: z.boolean().default(true),
  whatsapp: z.string().regex(/^\d{11}$/, "WhatsApp deve conter exatamente 11 dígitos").optional(),
  googleMapsUrl: z.string().url("URL do Google Maps deve ser válida").optional(),
});

export const insertFaqItemSchema = z.object({
  question: z.string()
    .min(1, "Pergunta é obrigatória")
    .max(500, "Pergunta deve ter no máximo 500 caracteres"),
  answer: z.string()
    .min(1, "Resposta é obrigatória")
    .max(2000, "Resposta deve ter no máximo 2000 caracteres"),
  displayOrder: z.number(),
  isActive: z.boolean().default(true),
});

export const insertSiteSettingsSchema = z.object({
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  cnpj: z.string().optional(),
  businessHours: z.string().optional(),
  ourStory: z.string().optional(),
  privacyPolicy: z.string().optional(),
  termsOfUse: z.string().optional(),
  address: z.string().optional(),
  mainImage: z.string().optional(),
  networkImage: z.string().optional(),
  aboutImage: z.string().optional(),
});

// Schema para file_metadata
export const insertFileMetadataSchema = z.object({
  objectId: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  extension: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
});

// Schemas para a área do cliente
export const insertClienteSchema = z.object({
  nome: z.string(),
  cpf: z.string(),
  email: z.string(),
  telefone: z.string(),
});

export const insertPlanoClienteSchema = z.object({
  clienteId: z.string(),
  planoId: z.string(),
  numeroApolice: z.string(),
  mensalidade: z.number(),
  vencimento: z.number(),
  formaPagamento: z.string(),
  coparticipacao: z.string(),
  status: z.string().default("ativo"),
  dataInicio: z.string(),
  dataFim: z.string().optional(),
});

export const insertBeneficioPlanoSchema = z.object({
  planoId: z.string(),
  tipoBeneficio: z.string(),
  carencia: z.string(),
  descricao: z.string(),
});

export const insertInformacaoContatoSchema = z.object({
  atendimento: z.string(),
  app: z.string(),
  site: z.string(),
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

// Types para a área do cliente
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type Cliente = typeof clientes.$inferSelect;
export type InsertPlanoCliente = z.infer<typeof insertPlanoClienteSchema>;
export type PlanoCliente = typeof planosClientes.$inferSelect;
export type InsertBeneficioPlano = z.infer<typeof insertBeneficioPlanoSchema>;
export type BeneficioPlano = typeof beneficiosPlanos.$inferSelect;
export type InsertInformacaoContato = z.infer<typeof insertInformacaoContatoSchema>;
export type InformacaoContato = typeof informacoesContato.$inferSelect;

// Admin user type
export interface AdminUser {
  id: string;
  username: string;
  createdAt: Date;
}


