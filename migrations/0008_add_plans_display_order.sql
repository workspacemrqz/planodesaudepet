-- Add display_order column to plans table
ALTER TABLE "plans" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;

-- Set initial display_order values for existing plans
UPDATE "plans" SET "display_order" = 1 WHERE "id" = (SELECT "id" FROM "plans" WHERE "is_popular" = false ORDER BY "created_at" ASC LIMIT 1);
UPDATE "plans" SET "display_order" = 2 WHERE "id" = (SELECT "id" FROM "plans" WHERE "is_popular" = true ORDER BY "created_at" ASC LIMIT 1);

-- Set any remaining plans to display_order 3+
WITH numbered_plans AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" ASC) as rn
  FROM "plans" 
  WHERE "display_order" = 0
)
UPDATE "plans" 
SET "display_order" = numbered_plans.rn + 2
FROM numbered_plans 
WHERE "plans"."id" = numbered_plans."id";
