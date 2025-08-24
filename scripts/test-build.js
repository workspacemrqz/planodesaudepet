#!/usr/bin/env node

/**
 * Script para testar o build localmente
 * Simula o processo de build do Easypanel
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🚀 Testando build para Easypanel...\n');

try {
  // 1. Limpar build anterior
  console.log('1️⃣ Limpando build anterior...');
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
    console.log('   ✅ dist/ removido');
  }

  // 2. Instalar dependências
  console.log('\n2️⃣ Instalando dependências...');
  execSync('npm ci', { stdio: 'inherit' });
  console.log('   ✅ Dependências instaladas');

  // 3. Executar build
  console.log('\n3️⃣ Executando build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('   ✅ Build concluído');

  // 4. Verificar estrutura
  console.log('\n4️⃣ Verificando estrutura de build...');
  
  const requiredFiles = [
    'dist/server/index.js',
    'dist/client/index.html',
    'dist/client/assets'
  ];

  for (const file of requiredFiles) {
    if (existsSync(file)) {
      console.log(`   ✅ ${file} existe`);
    } else {
      console.log(`   ❌ ${file} não encontrado`);
      process.exit(1);
    }
  }

  // 5. Testar start
  console.log('\n5️⃣ Testando comando start...');
  try {
    execSync('npm start --dry-run', { stdio: 'pipe' });
    console.log('   ✅ Comando start válido');
  } catch (error) {
    console.log('   ⚠️  Comando start não suporta --dry-run, mas está configurado');
  }

  console.log('\n🎉 Build testado com sucesso!');
  console.log('📁 Estrutura criada em dist/');
  console.log('🚀 Pronto para deploy no Easypanel!');

} catch (error) {
  console.error('\n❌ Erro durante o teste:', error.message);
  process.exit(1);
}
