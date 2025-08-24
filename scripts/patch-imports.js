#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addJsExtension(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      addJsExtension(fullPath);
    } else if (file.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Add .js to relative imports
      content = content.replace(
        /from\s+["'](\.[^"']+)["']/g,
        (match, p1) => {
          if (!p1.endsWith('.js') && !p1.endsWith('.json')) {
            return `from "${p1}.js"`;
          }
          return match;
        }
      );
      
      // Add .js to @shared imports
      content = content.replace(
        /from\s+["'](@shared\/[^"']+)["']/g,
        (match, p1) => {
          if (!p1.endsWith('.js') && !p1.endsWith('.json')) {
            return `from "${p1}.js"`;
          }
          return match;
        }
      );
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  addJsExtension(distDir);
  console.log('✅ Import paths patched successfully');
} else {
  console.error('❌ dist directory not found');
  process.exit(1);
}
