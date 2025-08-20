-- Add plan_type column to plans table and restructure pricing
DO $$ BEGIN
  CREATE TYPE plan_type_enum AS ENUM ('with_waiting_period', 'without_waiting_period');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_type plan_type_enum DEFAULT 'with_waiting_period';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price INTEGER;

-- Migrate existing data - use price_normal as the base price
UPDATE plans SET price = price_normal WHERE price IS NULL;

-- Make price column NOT NULL after migration
ALTER TABLE plans ALTER COLUMN price SET NOT NULL;

-- Drop old price columns (uncomment these lines after ensuring data migration is successful)
-- ALTER TABLE plans DROP COLUMN IF EXISTS price_normal;
-- ALTER TABLE plans DROP COLUMN IF EXISTS price_with_copay;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_plans_active_type ON plans(is_active, plan_type);
