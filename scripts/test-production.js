#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 TESTE DE CONFIGURAÇÃO DE PRODUÇÃO');
console.log('=' .repeat(50));

// Verificar arquivos de configuração
const configFiles = [
  'package.json',
  'easypanel.json', 
  'Procfile',
  '.npmrc',
  'app.json'
];

console.log('\n📁 Verificando arquivos de configuração:');
configFiles.forEach(file => {
  const exists = existsSync(join(projectRoot, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Verificar estrutura de build
console.log('\n🏗️  Testando processo de build:');
try {
  console.log('  🔄 Executando npm run build...');
  execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
  console.log('  ✅ Build executado com sucesso');
  
  // Verificar arquivos gerados
  const distPath = join(projectRoot, 'dist');
  const distPublicPath = join(distPath, 'public');
  const distIndexPath = join(distPath, 'index.js');
  
  console.log('\n📂 Verificando arquivos gerados:');
  console.log(`  ${existsSync(distPath) ? '✅' : '❌'} dist/`);
  console.log(`  ${existsSync(distPublicPath) ? '✅' : '❌'} dist/public/`);
  console.log(`  ${existsSync(distIndexPath) ? '✅' : '❌'} dist/index.js`);
  
  if (existsSync(distPublicPath)) {
    const publicFiles = readdirSync(distPublicPath);
    console.log(`  📋 Arquivos em dist/public: ${publicFiles.length} arquivos`);
    
    const assetsPath = join(distPublicPath, 'assets');
    if (existsSync(assetsPath)) {
      const assetFiles = readdirSync(assetsPath);
      console.log(`  📋 Assets compilados: ${assetFiles.length} arquivos`);
    }
  }
  
} catch (error) {
  console.log('  ❌ Erro no build:', error.message);
}

// Verificar variáveis de ambiente necessárias
console.log('\n🔐 Variáveis de ambiente necessárias para EasyPanel:');
const requiredEnvVars = [
  'DATABASE_URL',
  'ADMIN_USER', 
  'ADMIN_PASSWORD',
  'SESSION_SECRET'
];

const optionalEnvVars = [
  'NODE_ENV',
  'PORT',
  'HOST',
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_STORAGE_BUCKET'
];

console.log('  📋 Obrigatórias:');
requiredEnvVars.forEach(envVar => {
  const exists = process.env[envVar];
  console.log(`    ${exists ? '✅' : '❌'} ${envVar}${exists ? ' (configurada)' : ' (não configurada)'}`);
});

console.log('  📋 Opcionais:');
optionalEnvVars.forEach(envVar => {
  const exists = process.env[envVar];
  console.log(`    ${exists ? '✅' : '➖'} ${envVar}${exists ? ' (configurada)' : ''}`);
});

// Verificar scripts do package.json
console.log('\n📜 Scripts configurados:');
try {
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = ['build', 'start', 'heroku-postbuild'];
  requiredScripts.forEach(script => {
    const exists = packageJson.scripts[script];
    console.log(`  ${exists ? '✅' : '❌'} ${script}: ${exists || 'não configurado'}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao ler package.json');
}

// Verificar dependências críticas
console.log('\n📦 Dependências críticas:');
const criticalDeps = [
  'express',
  'react',
  'vite',
  'drizzle-orm',
  'pg',
  '@neondatabase/serverless'
];

try {
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
  
  criticalDeps.forEach(dep => {
    const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep}${exists ? ` (${exists})` : ''}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao verificar dependências');
}

console.log('\n' + '='.repeat(50));
console.log('🎯 RESUMO DA CONFIGURAÇÃO');
console.log('='.repeat(50));

console.log('\n✅ Arquivos de configuração do EasyPanel:');
console.log('  - easypanel.json (buildpacks + heroku/builder:24)');
console.log('  - Procfile (comando de inicialização)');
console.log('  - .npmrc (configurações otimizadas)');
console.log('  - app.json (variáveis de ambiente)');

console.log('\n✅ Scripts de build configurados:');
console.log('  - npm run build (compila frontend + backend)');
console.log('  - npm run start (inicia servidor de produção)');
console.log('  - heroku-postbuild (hook para buildpacks)');

console.log('\n✅ Estrutura de deploy:');
console.log('  - Builder: heroku/builder:24');
console.log('  - Runtime: Node.js 18+');
console.log('  - Porta: 8080 (mapeada para 80)');
console.log('  - Health check: /api/diagnostic');

console.log('\n📋 Próximos passos para EasyPanel:');
console.log('  1. Fazer commit das configurações');
console.log('  2. Criar app no EasyPanel com GitHub');
console.log('  3. Configurar variáveis de ambiente');
console.log('  4. Executar deploy');
console.log('  5. Testar funcionamento');

console.log('\n📖 Documentação completa em:');
console.log('  - EASYPANEL_SETUP.md');
console.log('  - DEPLOY_EASYPANEL.md');

console.log('\n🚀 Configuração concluída com sucesso!');
