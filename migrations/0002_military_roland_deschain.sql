CREATE TABLE "site_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"whatsapp" text,
	"email" text,
	"phone" text,
	"instagram_url" text,
	"facebook_url" text,
	"linkedin_url" text,
	"youtube_url" text,
	"cnpj" text,
	"business_hours" text,
	"our_story" text,
	"privacy_policy" text,
	"terms_of_use" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
