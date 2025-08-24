CREATE TYPE "public"."plan_type_enum" AS ENUM('with_waiting_period', 'without_waiting_period');--> statement-breakpoint
CREATE TABLE "beneficios_planos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plano_id" varchar NOT NULL,
	"tipo_beneficio" text NOT NULL,
	"carencia" text NOT NULL,
	"descricao" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cpf" varchar NOT NULL,
	"email" text NOT NULL,
	"telefone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "clientes_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"city" text NOT NULL,
	"pet_name" text NOT NULL,
	"animal_type" text NOT NULL,
	"pet_age" text NOT NULL,
	"plan_interest" text NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"display_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "informacoes_contato" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento" text NOT NULL,
	"app" text NOT NULL,
	"site" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_units" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" text,
	"google_maps_url" text,
	"rating" integer NOT NULL,
	"services" text[] NOT NULL,
	"image_data" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planos_clientes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" varchar NOT NULL,
	"plano_id" varchar NOT NULL,
	"numero_apolice" varchar NOT NULL,
	"mensalidade" integer NOT NULL,
	"vencimento" integer NOT NULL,
	"forma_pagamento" text NOT NULL,
	"coparticipacao" text NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "planos_clientes_numero_apolice_unique" UNIQUE("numero_apolice")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"features" text[] NOT NULL,
	"button_text" text DEFAULT 'Contratar Plano' NOT NULL,
	"redirect_url" text DEFAULT '/contact' NOT NULL,
	"plan_type" "plan_type_enum" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp (6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"whatsapp" text,
	"email" text,
	"phone" text,
	"address" text,
	"instagram_url" text,
	"facebook_url" text,
	"linkedin_url" text,
	"youtube_url" text,
	"cnpj" text,
	"business_hours" text,
	"our_story" text,
	"privacy_policy" text,
	"terms_of_use" text,
	"main_image_data" text,
	"network_image_data" text,
	"about_image_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beneficios_planos" ADD CONSTRAINT "beneficios_planos_plano_id_plans_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planos_clientes" ADD CONSTRAINT "planos_clientes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planos_clientes" ADD CONSTRAINT "planos_clientes_plano_id_plans_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;