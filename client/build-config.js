/**
 * Build configuration for image processing
 * This file ensures images are properly handled during build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Image formats supported by the application
const SUPPORTED_IMAGE_FORMATS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp'
];

// Directories to scan for images (relative to script location)
const IMAGE_DIRECTORIES = [
  'public',
  'src/assets',
  'src/components/assets'
];

// Check if we're running from root or client directory
const isRoot = fs.existsSync('client');
const baseDir = isRoot ? 'client' : '.';



/**
 * Validate image files exist and are accessible
 */
function validateImages() {
  console.log('🔍 Validating image files...');
  
  const missingImages = [];
  const validImages = [];
  
  IMAGE_DIRECTORIES.forEach(dir => {
    const fullDir = path.join(baseDir, dir);
    if (fs.existsSync(fullDir)) {
      const files = fs.readdirSync(fullDir, { recursive: true });
      
      files.forEach(file => {
        if (typeof file === 'string') {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_IMAGE_FORMATS.includes(ext)) {
            const fullPath = path.join(fullDir, file);
            if (fs.existsSync(fullPath)) {
              validImages.push(fullPath);
            } else {
              missingImages.push(fullPath);
            }
          }
        }
      });
    }
  });
  
  if (missingImages.length > 0) {
    console.warn('⚠️  Missing image files:', missingImages);
  }
  
  console.log(`✅ Found ${validImages.length} valid image files`);
  return { validImages, missingImages };
}

/**
 * Check for common image issues
 */
function checkImageIssues() {
  console.log('🔍 Checking for common image issues...');
  
  const issues = [];
  
  // Check if placeholder image exists
  const placeholderPath = path.join(baseDir, 'public/placeholder-image.svg');
  if (!fs.existsSync(placeholderPath)) {
    issues.push(`Placeholder image missing: ${placeholderPath}`);
  }
  
  // Check for large image files (>5MB)
  const largeImages = [];
  IMAGE_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      files.forEach(file => {
        if (typeof file === 'string') {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_IMAGE_FORMATS.includes(ext)) {
            const fullPath = path.join(dir, file);
            if (fs.existsSync(fullPath)) {
              const stats = fs.statSync(fullPath);
              if (stats.size > 5 * 1024 * 1024) { // 5MB
                largeImages.push({ path: fullPath, size: stats.size });
              }
            }
          }
        }
      });
    }
  });
  
  if (largeImages.length > 0) {
    issues.push(`Large image files detected (consider optimizing):`, largeImages);
  }
  
  if (issues.length === 0) {
    console.log('✅ No image issues detected');
  } else {
    console.warn('⚠️  Image issues detected:', issues);
  }
  
  return issues;
}

/**
 * Generate image manifest for build
 */
function generateImageManifest() {
  console.log('📝 Generating image manifest...');
  
  const manifest = {
    timestamp: new Date().toISOString(),
    images: [],
    totalSize: 0
  };
  
  IMAGE_DIRECTORIES.forEach(dir => {
    const fullDir = path.join(baseDir, dir);
    if (fs.existsSync(fullDir)) {
      const files = fs.readdirSync(fullDir, { recursive: true });
      
      files.forEach(file => {
        if (typeof file === 'string') {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_IMAGE_FORMATS.includes(ext)) {
            const fullPath = path.join(fullDir, file);
            if (fs.existsSync(fullPath)) {
              const stats = fs.statSync(fullPath);
              manifest.images.push({
                path: fullPath,
                size: stats.size,
                extension: ext,
                lastModified: stats.mtime
              });
              manifest.totalSize += stats.size;
            }
          }
        }
      });
    }
  });
  
  // Write manifest to file
  const manifestPath = 'image-manifest.json';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Image manifest generated: ${manifestPath}`);
  console.log(`📊 Total images: ${manifest.images.length}`);
  console.log(`📊 Total size: ${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  return manifest;
}

// Run validation if this file is executed directly
console.log('🚀 Starting image validation...\n');

const validation = validateImages();
const issues = checkImageIssues();
const manifest = generateImageManifest();

console.log('\n📋 Validation Summary:');
console.log(`✅ Valid images: ${validation.validImages.length}`);
console.log(`⚠️  Missing images: ${validation.missingImages.length}`);
console.log(`⚠️  Issues found: ${issues.length}`);

if (validation.missingImages.length === 0 && issues.length === 0) {
  console.log('\n🎉 All images are valid and ready for build!');
  process.exit(0);
} else {
  console.log('\n❌ Image validation failed. Please fix issues before building.');
  process.exit(1);
}

export {
  validateImages,
  checkImageIssues,
  generateImageManifest,
  SUPPORTED_IMAGE_FORMATS,
  IMAGE_DIRECTORIES
};
