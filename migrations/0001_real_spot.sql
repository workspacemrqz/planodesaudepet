ALTER TABLE "plans" ADD COLUMN "button_text" text DEFAULT 'Contratar Plano' NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "redirect_url" text DEFAULT '/contact' NOT NULL;