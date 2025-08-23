#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing direct module import...');

try {
  // Tentar importar o schema
  console.log('📦 Attempting to import schema...');
  
  // Mudar para o diretório dist/server para simular o ambiente de produção
  const originalCwd = process.cwd();
  const serverDir = path.join(__dirname, '..', 'dist', 'server');
  
  console.log(`📁 Changing to directory: ${serverDir}`);
  process.chdir(serverDir);
  
  // Tentar importar o schema
  const schema = await import('../shared/schema.js');
  
  console.log('✅ Schema imported successfully!');
  console.log('📋 Available exports:', Object.keys(schema));
  
  // Verificar se as exportações necessárias existem
  const requiredExports = [
    'insertContactSubmissionSchema',
    'insertPlanSchema',
    'insertNetworkUnitSchema',
    'insertFaqItemSchema',
    'insertSiteSettingsSchema'
  ];
  
  console.log('\n📦 Checking required exports:');
  requiredExports.forEach(exportName => {
    const hasExport = exportName in schema;
    console.log(`   ${exportName}: ${hasExport ? '✅' : '❌'}`);
  });
  
  // Restaurar diretório original
  process.chdir(originalCwd);
  
} catch (error) {
  console.error('❌ Error importing schema:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Restaurar diretório original em caso de erro
  try {
    process.chdir(originalCwd);
  } catch (e) {
    // Ignorar erro de restauração
  }
}

console.log('\n🎉 Import test completed!');
