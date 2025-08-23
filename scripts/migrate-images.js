#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting image migration process...');

// Configurações
const sourceUploadsDir = path.join(__dirname, '..', 'uploads');
const targetUploadsDir = path.join(__dirname, '..', 'dist', 'uploads');
const fallbackDir = path.join(__dirname, '..', 'dist', 'assets', 'fallback');

// Função para criar diretórios se não existirem
function ensureDirectories() {
  try {
    if (!fs.existsSync(targetUploadsDir)) {
      fs.mkdirSync(targetUploadsDir, { recursive: true });
      console.log('✅ Created target uploads directory:', targetUploadsDir);
    }
    
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
      console.log('✅ Created fallback directory:', fallbackDir);
    }
  } catch (error) {
    console.error('❌ Error creating directories:', error.message);
  }
}

// Função para copiar arquivo
function copyFile(sourcePath, targetPath) {
  try {
    fs.copyFileSync(sourcePath, targetPath);
    return true;
  } catch (error) {
    console.error(`❌ Error copying ${sourcePath}:`, error.message);
    return false;
  }
}

// Função para copiar diretório recursivamente
function copyDirectory(sourceDir, targetDir) {
  try {
    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Source directory not found: ${sourceDir}`);
      return { success: false, message: 'Source directory not found' };
    }
    
    const items = fs.readdirSync(sourceDir);
    let copiedCount = 0;
    let errorCount = 0;
    
    for (const item of items) {
      try {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
          // Criar subdiretório se não existir
          if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
          }
          // Copiar conteúdo do subdiretório
          const subResult = copyDirectory(sourcePath, targetPath);
          copiedCount += subResult.copiedCount || 0;
          errorCount += subResult.errorCount || 0;
        } else {
          // Copiar arquivo
          if (copyFile(sourcePath, targetPath)) {
            copiedCount++;
            console.log(`✅ Copied: ${item}`);
          } else {
            errorCount++;
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${item}:`, error.message);
      }
    }
    
    return { success: true, copiedCount, errorCount };
    
  } catch (error) {
    console.error('❌ Error copying directory:', error.message);
    return { success: false, error: error.message };
  }
}

// Função para criar imagens de fallback
function createFallbackImages() {
  try {
    console.log('🎨 Creating fallback images...');
    
    const fallbackTypes = ['default', 'profile', 'product', 'network', 'about'];
    
    fallbackTypes.forEach(type => {
      const fileName = `default-${type}.svg`;
      const filePath = path.join(fallbackDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        const svgContent = generateFallbackSVG(type);
        fs.writeFileSync(filePath, svgContent);
        console.log(`✅ Created fallback: ${fileName}`);
      } else {
        console.log(`ℹ️  Fallback already exists: ${fileName}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating fallback images:', error.message);
  }
}

// Função para gerar SVG de fallback
function generateFallbackSVG(type) {
  const colors = {
    default: '#e5e7eb',
    profile: '#3b82f6',
    product: '#10b981',
    network: '#f59e0b',
    about: '#8b5cf6'
  };
  
  const color = colors[type] || colors.default;
  const text = type.charAt(0).toUpperCase() + type.slice(1);
  
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${color}" opacity="0.1"/>
    <rect width="400" height="300" fill="none" stroke="${color}" stroke-width="2"/>
    <text x="200" y="150" font-family="Arial, sans-serif" font-size="24" fill="${color}" text-anchor="middle" dominant-baseline="middle">
      ${text} Image
    </text>
    <text x="200" y="180" font-family="Arial, sans-serif" font-size="14" fill="${color}" text-anchor="middle" dominant-baseline="middle">
      Placeholder
    </text>
  </svg>`;
}

// Função para copiar imagens essenciais do projeto
function copyEssentialImages() {
  try {
    console.log('📸 Copying essential project images...');
    
    const essentialImages = [
      'assets/images/logo.png',
      'assets/images/hero-bg.jpg',
      'assets/images/about-image.jpg',
      'assets/images/network-image.jpg',
      'assets/images/main-image.jpg'
    ];
    
    let copiedCount = 0;
    let errorCount = 0;
    
    essentialImages.forEach(imagePath => {
      const sourcePath = path.join(__dirname, '..', imagePath);
      const fileName = path.basename(imagePath);
      const targetPath = path.join(targetUploadsDir, fileName);
      
      if (fs.existsSync(sourcePath)) {
        if (copyFile(sourcePath, targetPath)) {
          copiedCount++;
          console.log(`✅ Copied essential: ${fileName}`);
        } else {
          errorCount++;
        }
      } else {
        console.log(`⚠️  Essential image not found: ${imagePath}`);
      }
    });
    
    return { copiedCount, errorCount };
    
  } catch (error) {
    console.error('❌ Error copying essential images:', error.message);
    return { copiedCount: 0, errorCount: 1 };
  }
}

// Função principal
async function migrateImages() {
  try {
    console.log('🚀 Starting comprehensive image migration...');
    
    // 1. Garantir diretórios
    ensureDirectories();
    
    // 2. Copiar imagens de uploads (se existirem)
    let uploadsResult = { copiedCount: 0, errorCount: 0 };
    if (fs.existsSync(sourceUploadsDir)) {
      console.log('📁 Migrating uploads directory...');
      uploadsResult = copyDirectory(sourceUploadsDir, targetUploadsDir);
    } else {
      console.log('⚠️  Uploads directory not found, skipping...');
    }
    
    // 3. Copiar imagens essenciais do projeto
    const essentialResult = copyEssentialImages();
    
    // 4. Criar imagens de fallback
    createFallbackImages();
    
    // 5. Resumo final
    const totalCopied = uploadsResult.copiedCount + essentialResult.copiedCount;
    const totalErrors = uploadsResult.errorCount + essentialResult.errorCount;
    
    console.log('\n🎉 Image migration completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Uploads copied: ${uploadsResult.copiedCount}`);
    console.log(`   - Essential images copied: ${essentialResult.copiedCount}`);
    console.log(`   - Total copied: ${totalCopied}`);
    console.log(`   - Total errors: ${totalErrors}`);
    console.log(`   - Target directory: ${targetUploadsDir}`);
    console.log(`   - Fallback directory: ${fallbackDir}`);
    
    return {
      success: true,
      totalCopied,
      totalErrors,
      targetUploadsDir,
      fallbackDir
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Executar migração
migrateImages().then(result => {
  if (result.success) {
    console.log('✅ Image migration completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Image migration failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Unexpected error during migration:', error);
  process.exit(1);
});
