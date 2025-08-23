import fs from 'fs';
import path from 'path';
import { autoConfig } from './config.js';

class ImageService {
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.fallbackDir = path.join(process.cwd(), 'assets', 'fallback');
    this.ensureDirectories();
  }

  // Garantir que os diretórios necessários existam
  ensureDirectories() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        console.log('📁 Created uploads directory:', this.uploadsDir);
      }
      
      if (!fs.existsSync(this.fallbackDir)) {
        fs.mkdirSync(this.fallbackDir, { recursive: true });
        console.log('📁 Created fallback directory:', this.fallbackDir);
      }
    } catch (error) {
      console.error('❌ Error creating directories:', error.message);
    }
  }

  // Verificar se uma imagem existe
  imageExists(imagePath) {
    try {
      if (!imagePath) return false;
      
      // Tentar caminho absoluto primeiro
      if (fs.existsSync(imagePath)) {
        return true;
      }
      
      // Tentar caminho relativo ao diretório uploads
      const relativePath = path.join(this.uploadsDir, path.basename(imagePath));
      if (fs.existsSync(relativePath)) {
        return true;
      }
      
      // Tentar apenas o nome do arquivo no diretório uploads
      const fileName = path.basename(imagePath);
      const fileNamePath = path.join(this.uploadsDir, fileName);
      if (fs.existsSync(fileNamePath)) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking image existence:', error.message);
      return false;
    }
  }

  // Obter caminho da imagem com fallback
  getImagePath(imagePath, fallbackType = 'default') {
    try {
      if (!imagePath) {
        return this.getFallbackImage(fallbackType);
      }
      
      // Tentar caminho absoluto
      if (fs.existsSync(imagePath)) {
        return imagePath;
      }
      
      // Tentar caminho relativo ao diretório uploads
      const relativePath = path.join(this.uploadsDir, path.basename(imagePath));
      if (fs.existsSync(relativePath)) {
        return relativePath;
      }
      
      // Tentar apenas o nome do arquivo
      const fileName = path.basename(imagePath);
      const fileNamePath = path.join(this.uploadsDir, fileName);
      if (fs.existsSync(fileNamePath)) {
        return fileNamePath;
      }
      
      // Se não encontrou, usar fallback
      console.log(`⚠️  Image not found: ${imagePath}, using fallback`);
      return this.getFallbackImage(fallbackType);
      
    } catch (error) {
      console.error('❌ Error getting image path:', error.message);
      return this.getFallbackImage(fallbackType);
    }
  }

  // Obter imagem de fallback
  getFallbackImage(type = 'default') {
    const fallbackImages = {
      default: 'default-image.jpg',
      profile: 'default-profile.jpg',
      product: 'default-product.jpg',
      network: 'default-network.jpg',
      about: 'default-about.jpg'
    };
    
    const fileName = fallbackImages[type] || fallbackImages.default;
    const fallbackPath = path.join(this.fallbackDir, fileName);
    
    // Se o fallback não existir, criar um básico
    if (!fs.existsSync(fallbackPath)) {
      this.createBasicFallbackImage(fallbackPath, type);
    }
    
    return fallbackPath;
  }

  // Criar imagem de fallback básica se não existir
  createBasicFallbackImage(filePath, type) {
    try {
      // Criar um arquivo SVG simples como fallback
      const svgContent = this.generateFallbackSVG(type);
      fs.writeFileSync(filePath, svgContent);
      console.log(`✅ Created fallback image: ${filePath}`);
    } catch (error) {
      console.error('❌ Error creating fallback image:', error.message);
    }
  }

  // Gerar SVG de fallback
  generateFallbackSVG(type) {
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

  // Servir imagem com fallback
  serveImage(res, imagePath, fallbackType = 'default') {
    try {
      const finalPath = this.getImagePath(imagePath, fallbackType);
      
      if (!fs.existsSync(finalPath)) {
        console.error(`❌ Fallback image not found: ${finalPath}`);
        return res.status(404).json({ error: 'Image not found' });
      }
      
      const ext = path.extname(finalPath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
      
      const imageBuffer = fs.readFileSync(finalPath);
      res.send(imageBuffer);
      
    } catch (error) {
      console.error('❌ Error serving image:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Listar todas as imagens disponíveis
  listAvailableImages() {
    try {
      const images = [];
      
      if (fs.existsSync(this.uploadsDir)) {
        const files = fs.readdirSync(this.uploadsDir);
        files.forEach(file => {
          const filePath = path.join(this.uploadsDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            images.push({
              name: file,
              path: filePath,
              size: stat.size,
              modified: stat.mtime
            });
          }
        });
      }
      
      return images;
    } catch (error) {
      console.error('❌ Error listing images:', error.message);
      return [];
    }
  }

  // Verificar saúde do sistema de imagens
  getSystemHealth() {
    try {
      const uploadsCount = this.listAvailableImages().length;
      const fallbackCount = fs.existsSync(this.fallbackDir) ? 
        fs.readdirSync(this.fallbackDir).length : 0;
      
      return {
        uploadsDirectory: this.uploadsDir,
        fallbackDirectory: this.fallbackDir,
        uploadsCount,
        fallbackCount,
        uploadsExists: fs.existsSync(this.uploadsDir),
        fallbackExists: fs.existsSync(this.fallbackDir),
        status: 'healthy'
      };
    } catch (error) {
      console.error('❌ Error getting system health:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Migrar imagens de desenvolvimento para produção
  async migrateImages(sourceDir) {
    try {
      console.log('🔄 Starting image migration...');
      
      if (!fs.existsSync(sourceDir)) {
        console.log('⚠️  Source directory not found:', sourceDir);
        return { success: false, message: 'Source directory not found' };
      }
      
      const sourceFiles = fs.readdirSync(sourceDir);
      let migratedCount = 0;
      let errorCount = 0;
      
      for (const file of sourceFiles) {
        try {
          const sourcePath = path.join(sourceDir, file);
          const targetPath = path.join(this.uploadsDir, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
            migratedCount++;
            console.log(`✅ Migrated: ${file}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error migrating ${file}:`, error.message);
        }
      }
      
      console.log(`🎉 Migration completed: ${migratedCount} files migrated, ${errorCount} errors`);
      
      return {
        success: true,
        migratedCount,
        errorCount,
        totalFiles: sourceFiles.length
      };
      
    } catch (error) {
      console.error('❌ Error during migration:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const imageService = new ImageService();
