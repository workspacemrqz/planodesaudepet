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
  id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  googleMapsUrl: text("google_maps_url"),
  rating: integer("rating").notNull(), // stored as 48 for 4.8 rating
  services: text("services").array().notNull(),
  imageData: text("image_data"), // Base64 image data instead of imageUrl
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
  id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
  mainImageData: text("main_image_data"), // Base64 instead of mainImage
  networkImageData: text("network_image_data"), // Base64 instead of networkImage
  aboutImageData: text("about_image_data"), // Base64 instead of aboutImage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// Remover a tabela fileMetadata completamente
// export const fileMetadata = pgTable("file_metadata", { ... });

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
}).extend({
  question: z.string()
    .min(1, "Pergunta é obrigatória")
    .max(500, "Pergunta deve ter no máximo 500 caracteres"),
  answer: z.string()
    .min(1, "Resposta é obrigatória")
    .max(2000, "Resposta deve ter no máximo 2000 caracteres"),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schemas para a área do cliente
export const insertClienteSchema = createInsertSchema(clientes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlanoClienteSchema = createInsertSchema(planosClientes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBeneficioPlanoSchema = createInsertSchema(beneficiosPlanos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInformacaoContatoSchema = createInsertSchema(informacoesContato).omit({
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


