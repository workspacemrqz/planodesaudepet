-- Migration: Add image column to plans table
-- This migration adds the missing image column that the application expects

-- Add the image column with a default value to avoid NULL constraint issues
ALTER TABLE "plans" ADD COLUMN "image" text NOT NULL DEFAULT '/BASICicon.svg';

-- Add comment to document the column
COMMENT ON COLUMN "plans"."image" IS 'URL or path to the plan image';

-- Update existing records to have a valid image path if they don't have one
UPDATE "plans" SET "image" = '/BASICicon.svg' WHERE "image" IS NULL OR "image" = '';
