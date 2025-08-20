import { db } from '../db';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
    
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('Database connection successful:', result);
    
    // Test if plans table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      ) as exists
    `);
    console.log('Plans table exists:', tableExists);
    
    // Check table structure
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position
    `);
    console.log('Plans table columns:', columns);
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection().then(() => {
  console.log('Database test completed');
  process.exit(0);
});
