#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distServerPath = path.join(__dirname, '..', 'dist', 'server');
const distSharedPath = path.join(__dirname, '..', 'dist', 'shared');

console.log('🔧 Patching imports in compiled server files...');

// Função para fazer patch de um arquivo
function patchFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Substituir imports @shared/schema por caminhos relativos
    if (content.includes('@shared/schema')) {
      content = content.replace(
        /from ['"]@shared\/schema['"]/g,
        "from '../shared/schema.js'"
      );
      modified = true;
    }

    // Substituir outros imports @shared/* por caminhos relativos
    if (content.includes('@shared/')) {
      content = content.replace(
        /from ['"]@shared\/([^'"]+)['"]/g,
        "from '../shared/$1.js'"
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Patched: ${path.relative(process.cwd(), filePath)}`);
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
console.log(`📁 Processing directory: ${distServerPath}`);
processDirectory(distServerPath);

console.log('🎉 Import patching completed!');
