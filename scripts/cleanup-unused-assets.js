
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findUnusedAssets() {
  console.log('🔍 Procurando assets não utilizados...');
  
  // Verificar imagens no public que não são referenciadas no código
  const publicDir = path.join(__dirname, '..', 'client', 'public');
  const srcDir = path.join(__dirname, '..', 'client', 'src');
  
  if (!fs.existsSync(publicDir)) {
    console.log('📁 Diretório public não encontrado');
    return;
  }
  
  const publicFiles = fs.readdirSync(publicDir);
  const srcFiles = fs.readdirSync(srcDir, { recursive: true });
  
  console.log(`📁 Encontrados ${publicFiles.length} arquivos em public/`);
  
  // Ler todo o código fonte para verificar referências
  let sourceCode = '';
  function readSourceFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        readSourceFiles(fullPath);
      } else if (file.name.match(/\.(tsx?|jsx?|css|scss)$/)) {
        sourceCode += fs.readFileSync(fullPath, 'utf8') + '\n';
      }
    }
  }
  
  readSourceFiles(srcDir);
  
  const unusedFiles = [];
  for (const file of publicFiles) {
    if (!sourceCode.includes(file) && !file.startsWith('.')) {
      unusedFiles.push(file);
    }
  }
  
  console.log(`🗑️  Arquivos possivelmente não utilizados: ${unusedFiles.length}`);
  unusedFiles.forEach(file => console.log(`   - ${file}`));
}

findUnusedAssets();
