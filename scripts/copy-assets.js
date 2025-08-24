#!/usr/bin/env node

/**
 * Script para copiar assets para o diretório de build
 * Garante que imagens e outros arquivos estáticos estejam disponíveis em produção
 */

import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const clientPublicDir = join(projectRoot, 'client', 'public');
const distClientDir = join(projectRoot, 'dist', 'client');
const distPublicDir = join(distClientDir, 'public');

function copyDirectory(src, dest) {
  // Criar diretório de destino se não existir
  if (!statSync(dest, { throwIfNoEntry: false })) {
    mkdirSync(dest, { recursive: true });
  }

  const items = readdirSync(src);
  
  for (const item of items) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`📁 Copiado: ${srcPath} → ${destPath}`);
    }
  }
}

function main() {
  try {
    console.log('🚀 Iniciando cópia de assets...');
    
    // Verificar se o diretório de origem existe
    if (!statSync(clientPublicDir, { throwIfNoEntry: false })) {
      console.log('⚠️ Diretório client/public não encontrado, pulando cópia de assets');
      return;
    }
    
    // Verificar se o diretório de destino existe
    if (!statSync(distClientDir, { throwIfNoEntry: false })) {
      console.log('⚠️ Diretório dist/client não encontrado, criando...');
      mkdirSync(distClientDir, { recursive: true });
    }
    
    // Copiar arquivos da pasta public
    console.log(`📁 Copiando assets de ${clientPublicDir} para ${distPublicDir}`);
    copyDirectory(clientPublicDir, distPublicDir);
    
    console.log('✅ Assets copiados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao copiar assets:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
