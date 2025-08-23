#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distServerPath = path.join(__dirname, '..', 'dist', 'server');

console.log('🔧 Patching imports in compiled server files...');
console.log(`📁 Processing directory: ${distServerPath}`);

// Função para fazer patch de um arquivo
function patchFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const changes = [];

    // Substituir imports @shared/schema por caminhos relativos com extensão .js
    if (content.includes('@shared/schema')) {
      const before = content.match(/from ['"]@shared\/schema['"]/g);
      if (before) {
        content = content.replace(
          /from ['"]@shared\/schema['"]/g,
          "from '../shared/schema.js'"
        );
        modified = true;
        changes.push(`@shared/schema → ../shared/schema.js (${before.length} occurrences)`);
      }
    }

    // Substituir outros imports @shared/* por caminhos relativos com extensão .js
    if (content.includes('@shared/')) {
      const before = content.match(/from ['"]@shared\/([^'"]+)['"]/g);
      if (before) {
        content = content.replace(
          /from ['"]@shared\/([^'"]+)['"]/g,
          "from '../shared/$1.js'"
        );
        modified = true;
        changes.push(`@shared/* → ../shared/*.js (${before.length} occurrences)`);
      }
    }

    // Verificar se há imports sem extensão .js que precisam ser corrigidos
    const relativeImports = content.match(/from ['"]\.\.\/shared\/[^'"]+(?!\.js)['"]/g);
    if (relativeImports) {
      content = content.replace(
        /from ['"](\.\.\/shared\/[^'"]+)(?!\.js)['"]/g,
        "from '$1.js'"
      );
      modified = true;
      changes.push(`Relative imports without .js → with .js (${relativeImports.length} occurrences)`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Patched: ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(`   📝 ${change}`));
    } else {
      console.log(`ℹ️  No changes needed: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error patching ${filePath}:`, error.message);
  }
}

// Função para processar recursivamente um diretório
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        patchFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
}

// Verificar se o diretório dist/server existe
if (!fs.existsSync(distServerPath)) {
  console.error('❌ Directory dist/server not found. Run build first.');
  process.exit(1);
}

// Processar todos os arquivos .js no diretório dist/server
processDirectory(distServerPath);

// Verificar se o arquivo schema.js existe e está acessível
const schemaPath = path.join(__dirname, '..', 'dist', 'shared', 'schema.js');
if (fs.existsSync(schemaPath)) {
  console.log(`✅ Schema file exists: ${path.relative(process.cwd(), schemaPath)}`);
  
  // Verificar conteúdo do schema
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const hasExports = schemaContent.includes('export');
    console.log(`📊 Schema file has exports: ${hasExports}`);
    
    if (!hasExports) {
      console.log('⚠️  Warning: Schema file has no exports!');
    }
  } catch (error) {
    console.error('❌ Error reading schema file:', error.message);
  }
} else {
  console.error(`❌ Schema file not found: ${path.relative(process.cwd(), schemaPath)}`);
}

console.log('🎉 Import patching completed!');
