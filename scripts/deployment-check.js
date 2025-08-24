#!/usr/bin/env node

/**
 * Script para verificar se o deployment está funcionando corretamente
 * Verifica banco de dados, arquivos estáticos e rotas da API
 */

import { Pool } from 'pg';
import { readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');

// Configuração do banco
const DATABASE_URL = process.env.DATABASE_URL;

async function checkDatabase() {
  if (!DATABASE_URL) {
    console.log('⚠️ DATABASE_URL não configurada, pulando verificação do banco');
    return false;
  }

  try {
    console.log('🔌 Verificando conexão com banco de dados...');
    
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco estabelecida');

    // Verificar se a coluna image existe na tabela plans
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'plans' AND column_name = 'image'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Coluna image existe na tabela plans');
    } else {
      console.log('❌ Coluna image NÃO existe na tabela plans');
      console.log('🔧 Execute: npm run db:init');
    }

    // Verificar se há dados na tabela plans
    const plansCount = await pool.query('SELECT COUNT(*) FROM plans');
    console.log(`📊 Tabela plans tem ${plansCount.rows[0].count} registros`);

    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message);
    return false;
  }
}

function checkStaticFiles() {
  try {
    console.log('📁 Verificando arquivos estáticos...');
    
    const distClientDir = join(projectRoot, 'dist', 'client');
    const distPublicDir = join(distClientDir, 'public');
    
    // Verificar se o diretório dist/client existe
    if (!statSync(distClientDir, { throwIfNoEntry: false })) {
      console.log('❌ Diretório dist/client não encontrado');
      console.log('🔧 Execute: npm run build');
      return false;
    }
    
    // Verificar se o diretório dist/client/public existe
    if (!statSync(distPublicDir, { throwIfNoEntry: false })) {
      console.log('❌ Diretório dist/client/public não encontrado');
      console.log('🔧 Execute: npm run copy:assets');
      return false;
    }
    
    // Verificar se há arquivos na pasta public
    const publicFiles = readdirSync(distPublicDir);
    console.log(`📁 Encontrados ${publicFiles.length} arquivos em dist/client/public`);
    
    // Verificar se há imagens importantes
    const importantImages = ['unipet-logo.png', 'BASICicon.svg', 'PLATINUM.svg'];
    for (const image of importantImages) {
      if (publicFiles.includes(image)) {
        console.log(`✅ Imagem ${image} encontrada`);
      } else {
        console.log(`⚠️ Imagem ${image} não encontrada`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar arquivos estáticos:', error.message);
    return false;
  }
}

function checkEnvironment() {
  try {
    console.log('🌍 Verificando variáveis de ambiente...');
    
    const requiredVars = ['NODE_ENV', 'PORT'];
    const optionalVars = ['DATABASE_URL', 'HOST'];
    
    for (const envVar of requiredVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: ${process.env[envVar]}`);
      } else {
        console.log(`❌ ${envVar}: não configurada`);
      }
    }
    
    for (const envVar of optionalVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: ${process.env[envVar]}`);
      } else {
        console.log(`⚠️ ${envVar}: não configurada (opcional)`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar variáveis de ambiente:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Verificação de deployment iniciada...\n');
    
    const checks = [
      { name: 'Variáveis de Ambiente', fn: checkEnvironment },
      { name: 'Arquivos Estáticos', fn: checkStaticFiles },
      { name: 'Banco de Dados', fn: checkDatabase }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      console.log(`\n🔍 Verificando: ${check.name}`);
      console.log('─'.repeat(50));
      
      const passed = await check.fn();
      if (!passed) {
        allPassed = false;
      }
      
      console.log('─'.repeat(50));
    }
    
    console.log('\n📋 RESUMO DA VERIFICAÇÃO:');
    console.log('─'.repeat(50));
    
    if (allPassed) {
      console.log('🎉 Todas as verificações passaram!');
      console.log('✅ Seu deployment está funcionando corretamente');
    } else {
      console.log('⚠️ Algumas verificações falharam');
      console.log('🔧 Verifique os problemas acima e execute os comandos sugeridos');
    }
    
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
