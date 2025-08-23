import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

// Enum para tipos de plano
export const planTypeEnum = pgEnum("plan_type_enum", ["with_waiting_period", "without_waiting_period"]);

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  buttonText: text("button_text").default("Contratar Plano").notNull(),
  redirectUrl: text("redirect_url").default("/contact").notNull(),
  planType: planTypeEnum("plan_type").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
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
  mensalidade: integer("mensalidade").notNull(), // em centavos
  vencimento: integer("vencimento").notNull(), // dia do mês
  formaPagamento: text("forma_pagamento").notNull(),
  coparticipacao: text("coparticipacao").notNull(),
  status: text("status").default("ativo").notNull(), // ativo, cancelado, suspenso
  dataInicio: timestamp("data_inicio").notNull(),
  dataFim: timestamp("data_fim"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const beneficiosPlanos = pgTable("beneficios_planos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planoId: varchar("plano_id").notNull().references(() => plans.id),
  tipoBeneficio: text("tipo_beneficio").notNull(), // consultas, exames, cirurgias, emergencias
  carencia: text("carencia").notNull(), // em dias ou "imediato"
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

// Insert schemas
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  // id: true, // LINHA 147 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 148 - COMENTADA PARA DEPLOY
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  // id: true, // LINHA 152 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 153 - COMENTADA PARA DEPLOY
});

export const insertNetworkUnitSchema = createInsertSchema(networkUnits).omit({
  // id: true, // LINHA 157 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 158 - COMENTADA PARA DEPLOY
}).extend({
  whatsapp: z.string().regex(/^\d{11}$/, "WhatsApp deve conter exatamente 11 dígitos").optional(),
  googleMapsUrl: z.string().url("URL do Google Maps deve ser válida").optional(),
});

export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  // id: true, // LINHA 165 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 166 - COMENTADA PARA DEPLOY
}).extend({
  question: z.string()
    .min(1, "Pergunta é obrigatória")
    .max(500, "Pergunta deve ter no máximo 500 caracteres"),
  answer: z.string()
    .min(1, "Resposta é obrigatória")
    .max(2000, "Resposta deve ter no máximo 2000 caracteres"),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  // id: true, // LINHA 177 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 178 - COMENTADA PARA DEPLOY
  // updatedAt: true, // LINHA 179 - COMENTADA PARA DEPLOY
});

export const insertFileMetadataSchema = createInsertSchema(fileMetadata).omit({
  // id: true, // LINHA 183 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 184 - COMENTADA PARA DEPLOY
  // updatedAt: true, // LINHA 185 - COMENTADA PARA DEPLOY
});

// Schemas para a área do cliente
export const insertClienteSchema = createInsertSchema(clientes).omit({
  // id: true, // LINHA 190 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 191 - COMENTADA PARA DEPLOY
  // updatedAt: true, // LINHA 192 - COMENTADA PARA DEPLOY
});

export const insertPlanoClienteSchema = createInsertSchema(planosClientes).omit({
  // id: true, // LINHA 196 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 197 - COMENTADA PARA DEPLOY
  // updatedAt: true, // LINHA 198 - COMENTADA PARA DEPLOY
});

export const insertBeneficioPlanoSchema = createInsertSchema(beneficiosPlanos).omit({
  // id: true, // LINHA 202 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 203 - COMENTADA PARA DEPLOY
  // updatedAt: true, // LINHA 204 - COMENTADA PARA DEPLOY
});

export const insertInformacaoContatoSchema = createInsertSchema(informacoesContato).omit({
  // id: true, // LINHA 208 - COMENTADA PARA DEPLOY
  // createdAt: true, // LINHA 209 - COMENTADA PARA DEPLOY
  // updatedAt: true, // LINHA 210 - COMENTADA PARA DEPLOY
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

// Admin user type for session management (no database table)
export interface AdminUser {
  id: string;
  username: string;
  createdAt: Date;
}


