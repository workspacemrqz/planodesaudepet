import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { autoConfig } from '../config';
import { log } from '../vite';

export async function initializeDatabase(): Promise<void> {
  try {
    log("Starting database initialization...");
    
    // Create a new pool for migrations
    const migrationPool = new Pool({ 
      connectionString: autoConfig.get('DATABASE_URL'),
      max: 1 // Use only one connection for migrations
    });
    
    const migrationDb = drizzle(migrationPool);
    
    // Check if we can connect to the database
    try {
      await migrationPool.query('SELECT 1');
      log("✅ Database connection successful");
    } catch (error) {
      log("❌ Database connection failed:", String(error));
      throw new Error(`Database connection failed: ${error}`);
    }
    
    // Check if the database schema exists by looking for one of our tables
    try {
      const result = await migrationPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'plans'
        );
      `);
      
      const tableExists = result.rows[0]?.exists;
      
      if (tableExists) {
        log("✅ Database schema already exists");
      } else {
        log("⚠️ Database schema not found, creating tables...");
        
        // Create tables using Drizzle schema
        // This will create all tables defined in shared/schema.ts
        await migrationDb.execute(`
          -- Create enum types first
          DO $$ BEGIN
            CREATE TYPE plan_type_enum AS ENUM ('with_waiting_period', 'without_waiting_period');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        
        // Create tables
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS contact_submissions (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            city TEXT NOT NULL,
            pet_name TEXT NOT NULL,
            animal_type TEXT NOT NULL,
            pet_age TEXT NOT NULL,
            plan_interest TEXT NOT NULL,
            message TEXT,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `);
        
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS plans (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            price INTEGER NOT NULL,
            description TEXT NOT NULL,
            features TEXT[] NOT NULL,
            button_text TEXT DEFAULT 'Contratar Plano' NOT NULL,
            redirect_url TEXT DEFAULT '/contact' NOT NULL,
            plan_type plan_type_enum NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            display_order INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `);
        
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS network_units (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            whatsapp TEXT,
            google_maps_url TEXT,
            rating INTEGER NOT NULL,
            services TEXT[] NOT NULL,
            image_url TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `);
        
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS faq_items (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            display_order INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `);
        
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS site_settings (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            whatsapp TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            instagram_url TEXT,
            facebook_url TEXT,
            linkedin_url TEXT,
            youtube_url TEXT,
            cnpj TEXT,
            business_hours TEXT,
            our_story TEXT,
            privacy_policy TEXT,
            terms_of_use TEXT,
            main_image TEXT,
            network_image TEXT,
            about_image TEXT,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `);
        
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS session (
            sid VARCHAR PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP(6) NOT NULL
          );
        `);
        
        await migrationDb.execute(`
          CREATE TABLE IF NOT EXISTS file_metadata (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            object_id VARCHAR NOT NULL UNIQUE,
            original_name TEXT NOT NULL,
            mime_type VARCHAR NOT NULL,
            extension VARCHAR NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `);
        
        log("✅ Database tables created successfully");
      }
      
    } catch (error) {
      log("❌ Error during schema creation:", String(error));
      throw new Error(`Schema creation failed: ${error}`);
    }
    
    // Close the migration pool
    await migrationPool.end();
    
    log("✅ Database initialization completed successfully");
    
  } catch (error) {
    log("❌ Database initialization failed:", String(error));
    throw error;
  }
}
