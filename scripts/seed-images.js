#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 Seeding default images...');

// Configurações
const targetUploadsDir = path.join(__dirname, '..', 'dist', 'uploads');
const fallbackDir = path.join(__dirname, '..', 'dist', 'assets', 'fallback');

// Função para criar diretórios se não existirem
function ensureDirectories() {
  try {
    if (!fs.existsSync(targetUploadsDir)) {
      fs.mkdirSync(targetUploadsDir, { recursive: true });
      console.log('✅ Created uploads directory:', targetUploadsDir);
    }
    
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
      console.log('✅ Created fallback directory:', fallbackDir);
    }
  } catch (error) {
    console.error('❌ Error creating directories:', error.message);
  }
}

// Função para gerar SVG de placeholder
function generatePlaceholderSVG(type, dimensions = { width: 400, height: 300 }) {
  const colors = {
    default: '#e5e7eb',
    profile: '#3b82f6',
    product: '#10b981',
    network: '#f59e0b',
    about: '#8b5cf6',
    logo: '#1f2937',
    hero: '#6366f1',
    main: '#059669'
  };
  
  const color = colors[type] || colors.default;
  const text = type.charAt(0).toUpperCase() + type.slice(1);
  const { width, height } = dimensions;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${color}" opacity="0.1"/>
    <rect width="${width}" height="${height}" fill="none" stroke="${color}" stroke-width="2"/>
    <text x="${width/2}" y="${height/2 - 20}" font-family="Arial, sans-serif" font-size="24" fill="${color}" text-anchor="middle" dominant-baseline="middle">
      ${text} Image
    </text>
    <text x="${width/2}" y="${height/2 + 20}" font-family="Arial, sans-serif" font-size="14" fill="${color}" text-anchor="middle" dominant-baseline="middle">
      Placeholder
    </text>
  </svg>`;
}

// Função para criar imagens de placeholder
function createPlaceholderImages() {
  try {
    console.log('🎨 Creating placeholder images...');
    
    const placeholders = [
      { name: 'default-image.svg', type: 'default', dimensions: { width: 400, height: 300 } },
      { name: 'default-profile.svg', type: 'profile', dimensions: { width: 200, height: 200 } },
      { name: 'default-product.svg', type: 'product', dimensions: { width: 300, height: 200 } },
      { name: 'default-network.svg', type: 'network', dimensions: { width: 400, height: 250 } },
      { name: 'default-about.svg', type: 'about', dimensions: { width: 500, height: 300 } },
      { name: 'logo-placeholder.svg', type: 'logo', dimensions: { width: 150, height: 50 } },
      { name: 'hero-placeholder.svg', type: 'hero', dimensions: { width: 1200, height: 400 } },
      { name: 'main-placeholder.svg', type: 'main', dimensions: { width: 800, height: 500 } }
    ];
    
    placeholders.forEach(placeholder => {
      const filePath = path.join(fallbackDir, placeholder.name);
      
      if (!fs.existsSync(filePath)) {
        const svgContent = generatePlaceholderSVG(placeholder.type, placeholder.dimensions);
        fs.writeFileSync(filePath, svgContent);
        console.log(`✅ Created placeholder: ${placeholder.name}`);
      } else {
        console.log(`ℹ️  Placeholder already exists: ${placeholder.name}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating placeholder images:', error.message);
  }
}

// Função para criar imagens de exemplo no diretório uploads
function createExampleImages() {
  try {
    console.log('📸 Creating example images in uploads...');
    
    const examples = [
      { name: 'example-network-1.svg', type: 'network', dimensions: { width: 400, height: 250 } },
      { name: 'example-network-2.svg', type: 'network', dimensions: { width: 400, height: 250 } },
      { name: 'example-about.svg', type: 'about', dimensions: { width: 500, height: 300 } },
      { name: 'example-main.svg', type: 'main', dimensions: { width: 800, height: 500 } }
    ];
    
    examples.forEach(example => {
      const filePath = path.join(targetUploadsDir, example.name);
      
      if (!fs.existsSync(filePath)) {
        const svgContent = generatePlaceholderSVG(example.type, example.dimensions);
        fs.writeFileSync(filePath, svgContent);
        console.log(`✅ Created example: ${example.name}`);
      } else {
        console.log(`ℹ️  Example already exists: ${example.name}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating example images:', error.message);
  }
}

// Função para verificar se há imagens reais
function checkRealImages() {
  try {
    console.log('🔍 Checking for real images...');
    
    const realImages = [];
    
    // Verificar se há imagens reais no diretório uploads
    if (fs.existsSync(targetUploadsDir)) {
      const files = fs.readdirSync(targetUploadsDir);
      files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          realImages.push(file);
        }
      });
    }
    
    if (realImages.length > 0) {
      console.log(`✅ Found ${realImages.length} real images:`, realImages);
    } else {
      console.log('⚠️  No real images found, using placeholders');
    }
    
    return realImages;
    
  } catch (error) {
    console.error('❌ Error checking real images:', error.message);
    return [];
  }
}

// Função principal
async function seedImages() {
  try {
    console.log('🚀 Starting image seeding process...');
    
    // 1. Garantir diretórios
    ensureDirectories();
    
    // 2. Verificar imagens reais
    const realImages = checkRealImages();
    
    // 3. Criar imagens de placeholder
    createPlaceholderImages();
    
    // 4. Se não houver imagens reais, criar exemplos
    if (realImages.length === 0) {
      createExampleImages();
    }
    
    // 5. Resumo final
    const placeholderCount = fs.existsSync(fallbackDir) ? fs.readdirSync(fallbackDir).length : 0;
    const uploadsCount = fs.existsSync(targetUploadsDir) ? fs.readdirSync(targetUploadsDir).length : 0;
    
    console.log('\n🎉 Image seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Real images found: ${realImages.length}`);
    console.log(`   - Placeholder images: ${placeholderCount}`);
    console.log(`   - Total uploads: ${uploadsCount}`);
    console.log(`   - Uploads directory: ${targetUploadsDir}`);
    console.log(`   - Fallback directory: ${fallbackDir}`);
    
    return {
      success: true,
      realImagesCount: realImages.length,
      placeholderCount,
      uploadsCount
    };
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Executar seeding
seedImages().then(result => {
  if (result.success) {
    console.log('✅ Image seeding completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Image seeding failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Unexpected error during seeding:', error);
  process.exit(1);
});
