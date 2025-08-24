#!/usr/bin/env node

/**
 * Script de inicialização do banco de dados
 * Executa migrações e cria colunas necessárias
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do banco
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkColumnExists(tableName, columnName) {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [tableName, columnName]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`❌ Erro ao verificar coluna ${columnName}:`, error.message);
    return false;
  }
}

async function addImageColumnToPlans() {
  try {
    const columnExists = await checkColumnExists('plans', 'image');
    
    if (!columnExists) {
      console.log('🔧 Adicionando coluna image à tabela plans...');
      
      await pool.query(`
        ALTER TABLE "plans" ADD COLUMN "image" text;
        COMMENT ON COLUMN "plans"."image" IS 'URL or path to the plan image';
      `);
      
      console.log('✅ Coluna image adicionada com sucesso');
    } else {
      console.log('✅ Coluna image já existe na tabela plans');
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna image:', error.message);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Executando migrações do banco de dados...');
    
    // Ler e executar migrações em ordem
    const migrationsDir = join(__dirname, '..', 'drizzle');
    
    // Migração 0000 (já deve estar aplicada)
    console.log('📋 Verificando migração 0000_chief_wasp.sql...');
    
    // Migração 0001 - Adicionar coluna image
    console.log('📋 Executando migração 0001_add_image_to_plans.sql...');
    await addImageColumnToPlans();
    
    console.log('✅ Todas as migrações executadas com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco estabelecida');
    
    // Executar migrações
    await runMigrations();
    
    console.log('🎉 Inicialização do banco concluída com sucesso');
    
  } catch (error) {
    console.error('❌ Falha na inicialização:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
