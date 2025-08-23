#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing module resolution...');

// Verificar estrutura de diretórios
const distPath = path.join(__dirname, '..', 'dist');
const serverPath = path.join(distPath, 'server');
const sharedPath = path.join(distPath, 'shared');

console.log(`📁 Checking directory structure:`);
console.log(`   dist: ${fs.existsSync(distPath) ? '✅' : '❌'}`);
console.log(`   server: ${fs.existsSync(serverPath) ? '✅' : '❌'}`);
console.log(`   shared: ${fs.existsSync(sharedPath) ? '✅' : '❌'}`);

// Verificar arquivos críticos
const criticalFiles = [
  'dist/server/index.js',
  'dist/server/routes.js',
  'dist/shared/schema.js'
];

console.log(`\n📄 Checking critical files:`);
criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
  
  if (exists) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasImports = content.includes('import');
      const hasExports = content.includes('export');
      console.log(`     - Has imports: ${hasImports ? '✅' : '❌'}`);
      console.log(`     - Has exports: ${hasExports ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`     - Error reading: ${error.message}`);
    }
  }
});

// Verificar imports específicos
console.log(`\n🔍 Checking specific imports:`);

// Verificar routes.js
const routesPath = path.join(__dirname, '..', 'dist', 'server', 'routes.js');
if (fs.existsSync(routesPath)) {
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  
  // Verificar se o import do schema está correto
  const schemaImports = routesContent.match(/from ['"]([^'"]+)['"]/g);
  if (schemaImports) {
    console.log(`   routes.js imports found:`);
    schemaImports.forEach(importLine => {
      console.log(`     ${importLine}`);
      
      // Verificar se é um import relativo para shared
      if (importLine.includes('../shared/')) {
        const importPath = importLine.match(/from ['"]([^'"]+)['"]/)[1];
        const resolvedPath = path.resolve(path.join(__dirname, '..', 'dist', 'server', importPath));
        const targetExists = fs.existsSync(resolvedPath);
        console.log(`       Import path: ${importPath}`);
        console.log(`       Resolves to: ${resolvedPath}`);
        console.log(`       Target exists: ${targetExists ? '✅' : '❌'}`);
      }
    });
  }
}

// Verificar se schema.js tem as exportações necessárias
const schemaPath = path.join(__dirname, '..', 'dist', 'shared', 'schema.js');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const requiredExports = [
    'insertContactSubmissionSchema',
    'insertPlanSchema',
    'insertNetworkUnitSchema',
    'insertFaqItemSchema',
    'insertSiteSettingsSchema'
  ];
  
  console.log(`\n📦 Checking required exports in schema.js:`);
  requiredExports.forEach(exportName => {
    const hasExport = schemaContent.includes(`export const ${exportName}`);
    console.log(`   ${exportName}: ${hasExport ? '✅' : '❌'}`);
  });
}

console.log(`\n🎉 Module resolution test completed!`);
