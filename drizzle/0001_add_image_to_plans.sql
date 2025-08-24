-- Migration: Add image column to plans table
-- This migration adds the missing image column that the application expects

ALTER TABLE "plans" ADD COLUMN "image" text;

-- Add comment to document the column
COMMENT ON COLUMN "plans"."image" IS 'URL or path to the plan image';
