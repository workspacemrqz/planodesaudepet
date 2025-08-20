#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Log environment information
console.log('='.repeat(60));
console.log('PRODUCTION SERVER STARTUP');
console.log('='.repeat(60));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT || '8080'}`);
console.log(`Working Directory: ${process.cwd()}`);
console.log(`Script Directory: ${__dirname}`);

// Check if dist directory exists
const distPath = join(process.cwd(), 'dist');
const distPublicPath = join(distPath, 'public');
const distIndexPath = join(distPath, 'index.js');

console.log('\nChecking build files:');
console.log(`- dist directory: ${existsSync(distPath) ? '✓ EXISTS' : '✗ NOT FOUND'}`);
console.log(`- dist/public directory: ${existsSync(distPublicPath) ? '✓ EXISTS' : '✗ NOT FOUND'}`);
console.log(`- dist/index.js: ${existsSync(distIndexPath) ? '✓ EXISTS' : '✗ NOT FOUND'}`);

if (existsSync(distPublicPath)) {
  const publicFiles = readdirSync(distPublicPath);
  console.log(`\nFiles in dist/public: ${publicFiles.slice(0, 5).join(', ')}${publicFiles.length > 5 ? ` ... (${publicFiles.length} total)` : ''}`);
  
  const assetsPath = join(distPublicPath, 'assets');
  if (existsSync(assetsPath)) {
    const assetFiles = readdirSync(assetsPath);
    console.log(`Files in dist/public/assets: ${assetFiles.slice(0, 5).join(', ')}${assetFiles.length > 5 ? ` ... (${assetFiles.length} total)` : ''}`);
  }
}

if (!existsSync(distIndexPath)) {
  console.error('\n❌ ERROR: Server file not found at dist/index.js');
  console.error('Please run "npm run build" first');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('Starting server...');
console.log('='.repeat(60) + '\n');

// Import and start the server
import(distIndexPath).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
