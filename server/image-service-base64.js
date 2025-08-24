import sharp from 'sharp';
import multer from 'multer';

class ImageServiceBase64 {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  }

  getUploadMiddleware() {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: this.maxFileSize },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed'));
        }
      }
    });
  }

  async processImageToBase64(buffer, options = {}) {
    try {
      const { width = 800, height = 600, quality = 80, format = 'jpeg' } = options;
      
      const processedBuffer = await sharp(buffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .toFormat(format, { quality })
        .toBuffer();

      const base64 = `data:image/${format};base64,${processedBuffer.toString('base64')}`;
      
      return {
        success: true,
        base64,
        size: processedBuffer.length,
        format,
        dimensions: { width, height }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateBase64(base64String) {
    if (!base64String) return false;
    const regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    return regex.test(base64String);
  }

  getBase64Info(base64String) {
    if (!this.validateBase64(base64String)) return null;
    
    const matches = base64String.match(/^data:image\/(\w+);base64,/);
    if (!matches) return null;
    
    const format = matches[1];
    const base64Data = base64String.split(',')[1];
    const sizeInBytes = Buffer.from(base64Data, 'base64').length;
    
    return {
      format,
      mimeType: `image/${format}`,
      sizeInBytes,
      sizeInKB: Math.round(sizeInBytes / 1024),
      sizeInMB: Math.round(sizeInBytes / (1024 * 1024) * 100) / 100
    };
  }
}

export const imageServiceBase64 = new ImageServiceBase64();
