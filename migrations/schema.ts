import { pgTable, unique, varchar, text, timestamp, integer, boolean, index, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const adminUsers = pgTable("admin_users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("admin_users_username_unique").on(table.username),
]);

export const contactSubmissions = pgTable("contact_submissions", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	city: text().notNull(),
	petName: text("pet_name").notNull(),
	animalType: text("animal_type").notNull(),
	petAge: text("pet_age").notNull(),
	planInterest: text("plan_interest").notNull(),
	message: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const faqItems = pgTable("faq_items", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	displayOrder: integer("display_order").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const networkUnits = pgTable("network_units", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	address: text().notNull(),
	phone: text().notNull(),
	rating: integer().notNull(),
	services: text().array().notNull(),
	imageUrl: text("image_url").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const plans = pgTable("plans", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	priceNormal: integer("price_normal").notNull(),
	priceWithCopay: integer("price_with_copay").notNull(),
	description: text().notNull(),
	features: text().array().notNull(),
	isPopular: boolean("is_popular").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	buttonText: text("button_text").default('Contratar Plano').notNull(),
	redirectUrl: text("redirect_url").default('/contact').notNull(),
});

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);
