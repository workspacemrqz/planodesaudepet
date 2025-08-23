#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '..', 'shared');
const targetPath = path.join(__dirname, '..', 'dist', 'shared');

console.log('📁 Copying shared files...');
console.log(`From: ${sourcePath}`);
console.log(`To: ${targetPath}`);

// Função para copiar recursivamente um diretório
function copyDirectory(src, dest) {
  try {
    // Criar diretório de destino se não existir
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied: ${path.relative(process.cwd(), srcPath)} -> ${path.relative(process.cwd(), destPath)}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error copying directory ${src}:`, error.message);
  }
}

// Verificar se o diretório fonte existe
if (!fs.existsSync(sourcePath)) {
  console.error('❌ Source directory shared not found.');
  process.exit(1);
}

// Verificar se o diretório dist existe
const distPath = path.dirname(targetPath);
if (!fs.existsSync(distPath)) {
  console.log('📁 Creating dist directory...');
  fs.mkdirSync(distPath, { recursive: true });
}

// Copiar arquivos
copyDirectory(sourcePath, targetPath);

console.log('🎉 Shared files copying completed!');
