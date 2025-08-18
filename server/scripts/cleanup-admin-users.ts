import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { adminUsers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanupAdminUsers() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);
  
  try {
    console.log('🧹 Limpando usuários admin existentes...');
    
    // Delete all existing admin users
    const deleteResult = await db.delete(adminUsers);
    console.log(`✅ Removidos todos os usuários admin existentes`);
    
    // Get credentials from environment
    const adminUsername = process.env.LOGIN;
    const adminPassword = process.env.SENHA;
    
    if (!adminUsername || !adminPassword) {
      throw new Error('LOGIN and SENHA environment variables must be defined in .env file');
    }
    
    // Create new admin user with environment credentials
    const hashedPassword = await hashPassword(adminPassword);
    const [newUser] = await db.insert(adminUsers).values({
      username: adminUsername,
      password: hashedPassword,
    }).returning();
    
    console.log(`✅ Criado novo usuário admin: ${newUser.username}`);
    console.log('🔒 Agora apenas as credenciais do .env funcionarão');
    
  } catch (error) {
    console.error('❌ Erro ao limpar usuários admin:', error);
  } finally {
    await client.end();
  }
}

// Import hashPassword function inline since we can't import from auth.ts directly
async function hashPassword(password: string) {
  const { scrypt, randomBytes } = await import('crypto');
  const { promisify } = await import('util');
  
  const scryptAsync = promisify(scrypt);
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

cleanupAdminUsers();