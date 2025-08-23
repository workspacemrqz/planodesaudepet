import multer from 'multer';
import sharp from 'sharp';

class ImageServiceBase64 {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  // Configurar multer para upload
  getUploadMiddleware() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
        }
      }
    });
  }

  // Processar imagem e converter para Base64
  async processImageToBase64(imageBuffer, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg'
      } = options;

      // Processar imagem com Sharp
      let processedImage = sharp(imageBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Aplicar formato e qualidade
      if (format === 'jpeg') {
        processedImage = processedImage.jpeg({ quality });
      } else if (format === 'png') {
        processedImage = processedImage.png({ quality });
      } else if (format === 'webp') {
        processedImage = processedImage.webp({ quality });
      }

      // Converter para buffer
      const processedBuffer = await processedImage.toBuffer();
      
      // Converter para Base64
      const base64String = `data:image/${format};base64,${processedBuffer.toString('base64')}`;
      
      return {
        success: true,
        base64: base64String,
        size: processedBuffer.length,
        format: format,
        dimensions: { width, height }
      };

    } catch (error) {
      console.error('❌ Error processing image to Base64:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validar Base64 string
  validateBase64(base64String) {
    try {
      if (!base64String || typeof base64String !== 'string') {
        return false;
      }

      // Verificar formato data:image/...;base64,...
      const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
      if (!base64Regex.test(base64String)) {
        return false;
      }

      // Verificar se o conteúdo Base64 é válido
      const base64Data = base64String.split(',')[1];
      if (!base64Data) {
        return false;
      }

      // Tentar decodificar
      Buffer.from(base64Data, 'base64');
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Extrair informações do Base64
  getBase64Info(base64String) {
    try {
      const match = base64String.match(/^data:image\/([^;]+);base64,(.+)$/);
      if (!match) {
        return null;
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      return {
        mimeType: `image/${mimeType}`,
        size: buffer.length,
        extension: mimeType === 'jpeg' ? 'jpg' : mimeType
      };
    } catch (error) {
      console.error('❌ Error extracting Base64 info:', error.message);
      return null;
    }
  }

  // Comprimir Base64 existente
  async compressBase64(base64String, options = {}) {
    try {
      const {
        quality = 70,
        maxWidth = 800,
        maxHeight = 600
      } = options;

      // Extrair dados do Base64
      const base64Data = base64String.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      // Comprimir com Sharp
      const compressedBuffer = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toBuffer();

      // Retornar novo Base64 comprimido
      const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
      
      return {
        success: true,
        base64: compressedBase64,
        originalSize: buffer.length,
        compressedSize: compressedBuffer.length,
        compressionRatio: Math.round((1 - compressedBuffer.length / buffer.length) * 100)
      };

    } catch (error) {
      console.error('❌ Error compressing Base64:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const imageServiceBase64 = new ImageServiceBase64();
