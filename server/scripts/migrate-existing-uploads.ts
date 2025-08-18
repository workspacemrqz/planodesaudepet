// Load environment variables first
import { config } from 'dotenv';
config();

import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { storage } from '../storage';
import { db } from '../db';

/**
 * Script to migrate existing uploaded files to the new metadata system
 * This script will:
 * 1. Scan the uploads directory for existing files
 * 2. Detect the correct file type using magic bytes
 * 3. Create metadata entries in the database
 * 4. Handle any inconsistencies or errors
 */

const uploadDir = path.join(process.cwd(), 'uploads');

async function migrateExistingUploads() {
  console.log('🚀 Starting migration of existing uploads...');
  console.log('Upload directory:', uploadDir);
  
  if (!fs.existsSync(uploadDir)) {
    console.log('❌ Upload directory does not exist:', uploadDir);
    return;
  }
  
  const files = fs.readdirSync(uploadDir);
  console.log(`📁 Found ${files.length} files to process`);
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const filename of files) {
    const filePath = path.join(uploadDir, filename);
    
    try {
      // Skip directories
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        console.log(`⏭️  Skipping directory: ${filename}`);
        skipped++;
        continue;
      }
      
      // Extract objectId from filename (remove extension)
      const objectId = path.parse(filename).name;
      console.log(`\n🔍 Processing file: ${filename} (objectId: ${objectId})`);
      
      // Check if metadata already exists
      const existingMetadata = await storage.getFileMetadata(objectId);
      if (existingMetadata) {
        console.log(`✅ Metadata already exists for ${objectId}, skipping`);
        skipped++;
        continue;
      }
      
      // Read file and detect type
      const fileBuffer = fs.readFileSync(filePath);
      const detectedType = await fileTypeFromBuffer(fileBuffer);
      
      if (!detectedType) {
        console.log(`❌ Could not detect file type for ${filename}`);
        errors++;
        continue;
      }
      
      if (!detectedType.mime.startsWith('image/')) {
        console.log(`⚠️  File ${filename} is not an image (${detectedType.mime}), skipping`);
        skipped++;
        continue;
      }
      
      // Create metadata entry
      const fileMetadata = {
        objectId,
        originalName: filename,
        mimeType: detectedType.mime,
        extension: `.${detectedType.ext}`,
        filePath: filePath,
        fileSize: stats.size
      };
      
      console.log(`📝 Creating metadata:`, {
        objectId: fileMetadata.objectId,
        mimeType: fileMetadata.mimeType,
        extension: fileMetadata.extension,
        size: fileMetadata.fileSize
      });
      
      await storage.createFileMetadata(fileMetadata);
      
      // Check if the file extension matches the detected type
      const currentExtension = path.extname(filename).toLowerCase();
      const correctExtension = `.${detectedType.ext}`;
      
      if (currentExtension !== correctExtension) {
        console.log(`⚠️  Extension mismatch for ${filename}: current=${currentExtension}, correct=${correctExtension}`);
        console.log(`   File will be served with correct MIME type via canonical URL`);
      }
      
      processed++;
      console.log(`✅ Successfully processed ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error);
      errors++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📁 Total files: ${files.length}`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some files had errors. Please review the logs above.');
  } else {
    console.log('\n🎉 Migration completed successfully!');
  }
}

// Run the migration
migrateExistingUploads()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

export { migrateExistingUploads };