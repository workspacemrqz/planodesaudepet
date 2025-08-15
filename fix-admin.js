const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { adminUsers } = require('./dist/shared/schema.js');
const { eq } = require('drizzle-orm');

require('dotenv').config();

async function fixAdminUsers() {
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);
  
  try {
    // Delete the admin123 user
    const result = await db.delete(adminUsers).where(eq(adminUsers.username, 'admin123'));
    console.log('Deleted admin123 user:', result);
    
    // List remaining users
    const remaining = await db.select().from(adminUsers);
    console.log('Remaining admin users:', remaining);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixAdminUsers();