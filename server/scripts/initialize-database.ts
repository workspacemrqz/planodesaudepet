import { db } from '../db';
import { sql } from 'drizzle-orm';
import { plans } from '../../shared/schema';

export async function initializeDatabase() {
  try {
    console.log('🔧 Checking database schema and data...');
    
    // Check if plans table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      );
    `);
    
    // Always ensure all tables exist, regardless of plans table status
    console.log('🔧 Ensuring all database tables exist...');
    
    // Create the enum first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE plan_type_enum AS ENUM ('with_waiting_period', 'without_waiting_period');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Create all necessary tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NOT NULL,
        phone text NOT NULL,
        city text NOT NULL,
        pet_name text NOT NULL,
        animal_type text NOT NULL,
        pet_age text NOT NULL,
        plan_interest text NOT NULL,
        message text,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS plans (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL UNIQUE,
        price integer NOT NULL,
        description text NOT NULL,
        features text[] NOT NULL,
        button_text text DEFAULT 'Contratar Plano' NOT NULL,
        redirect_url text DEFAULT '/contact' NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        display_order integer DEFAULT 0 NOT NULL,
        plan_type plan_type_enum DEFAULT 'with_waiting_period' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        whatsapp text,
        email text,
        phone text,
        address text,
        instagram_url text,
        facebook_url text,
        linkedin_url text,
        youtube_url text,
        cnpj text,
        business_hours text,
        our_story text,
        privacy_policy text,
        terms_of_use text,
        main_image text,
        network_image text,
        about_image text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS network_units (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        address text NOT NULL,
        phone text NOT NULL,
        whatsapp text,
        google_maps_url text,
        rating integer NOT NULL,
        services text[] NOT NULL,
        image_url text,
        is_active boolean DEFAULT true NOT NULL,
        display_order integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS faqs (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        question text NOT NULL,
        answer text NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        display_order integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS file_metadata (
        object_id varchar PRIMARY KEY,
        original_filename text NOT NULL,
        mime_type text NOT NULL,
        size_bytes bigint NOT NULL,
        upload_date timestamp DEFAULT now() NOT NULL,
        uploader_id text,
        metadata jsonb DEFAULT '{}' NOT NULL
      );
    `);
    
    console.log('✅ Database schema created successfully!');
    
    // Check current columns in plans table
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns in plans table:');
    // Handle PostgreSQL Result object - extract rows array
    const columnsArray = columns.rows || columns;
    
    if (Array.isArray(columnsArray)) {
      columnsArray.forEach((col: any) => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('Unexpected columns format:', columns);
    }
    
    // Check if we have old schema (price_normal, price_with_copay) or new schema (price)
    const hasOldPriceColumns = columnsArray.some((col: any) => 
      col.column_name === 'price_normal' || col.column_name === 'price_with_copay'
    );
    const hasNewPriceColumn = columnsArray.some((col: any) => col.column_name === 'price');
    const hasIsPopularColumn = columnsArray.some((col: any) => col.column_name === 'is_popular');
    const hasPlanTypeColumn = columnsArray.some((col: any) => col.column_name === 'plan_type');
    
    console.log('Schema analysis:');
    console.log('- Has old price columns (price_normal/price_with_copay):', hasOldPriceColumns);
    console.log('- Has new price column:', hasNewPriceColumn);
    console.log('- Has is_popular column:', hasIsPopularColumn);
    console.log('- Has plan_type column:', hasPlanTypeColumn);
    
    // Always check and migrate schema if needed
    if (!hasNewPriceColumn) {
      console.log('🔧 Schema migration needed - adding missing price column...');
      
      // Step 1: Add new columns if they don't exist
      console.log('Adding price column...');
      await db.execute(sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0 NOT NULL`);
      
      if (!hasPlanTypeColumn) {
        console.log('Adding plan_type enum and column...');
        // Create enum if it doesn't exist
        await db.execute(sql`
          DO $$ BEGIN
            CREATE TYPE plan_type_enum AS ENUM ('with_waiting_period', 'without_waiting_period');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        await db.execute(sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_type plan_type_enum DEFAULT 'with_waiting_period' NOT NULL`);
      }
      
      // Step 2: Migrate data from old columns to new columns if they exist
      if (hasOldPriceColumns) {
        console.log('Migrating price data from old columns...');
        await db.execute(sql`
          UPDATE plans 
          SET price = COALESCE(price_normal, price_with_copay, 0)
          WHERE price = 0 AND (price_normal IS NOT NULL OR price_with_copay IS NOT NULL)
        `);
      }
      
      console.log('✅ Schema migration completed!');
    } else {
      console.log('✅ Schema is up to date!');
    }
    
    // Now clean up old columns and data if needed
    if (hasOldPriceColumns || hasIsPopularColumn) {
      console.log('🧹 Cleaning up old schema...');
      
      // Remove old columns if they exist
      if (hasIsPopularColumn) {
        console.log('Removing is_popular column...');
        await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS is_popular`);
      }
      if (hasOldPriceColumns) {
        console.log('Removing old price columns...');
        await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS price_normal`);
        await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS price_with_copay`);
      }
      
      // Clear old plans and insert new ones
      console.log('Clearing old plans data...');
      await db.execute(sql`DELETE FROM plans`);
      
      console.log('✅ Old schema cleanup completed!');
    }
    
    // Plans table created - no automatic data insertion
    console.log('✅ Plans table ready for manual configuration via admin panel');
    
    // No automatic data insertion - all data should be managed via admin panel
    
    // Check if site_settings table exists first
    const siteSettingsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `);
    
    if (!siteSettingsTableExists[0]?.exists) {
      console.log('⚠️ site_settings table does not exist. Creating it now...');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS site_settings (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          whatsapp text,
          email text,
          phone text,
          address text,
          instagram_url text,
          facebook_url text,
          linkedin_url text,
          youtube_url text,
          cnpj text,
          business_hours text,
          our_story text,
          privacy_policy text,
          terms_of_use text,
          main_image text,
          network_image text,
          about_image text,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log('✅ site_settings table created successfully!');
    }
    
    // Site settings table created - no automatic data insertion
    console.log('✅ Site settings table ready for manual configuration via admin panel');
    
    console.log('✅ Database initialization completed - tables created, no automatic data insertion');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// If this file is run directly (not imported), execute the initialization
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then(() => {
    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
}
