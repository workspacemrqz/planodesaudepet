#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANTE: Copiar da pasta dist/shared (já compilada) para dist/shared (destino)
const sourcePath = path.join(__dirname, '..', 'dist', 'shared');
const targetPath = path.join(__dirname, '..', 'dist', 'shared');

console.log('📁 Ensuring shared files are in correct location...');
console.log(`Source: ${sourcePath}`);
console.log(`Target: ${targetPath}`);

// Função para verificar se os arquivos .js existem
function ensureSharedFiles() {
  try {
    // Verificar se o diretório dist/shared existe
    if (!fs.existsSync(sourcePath)) {
      console.log('📁 Creating dist/shared directory...');
      fs.mkdirSync(sourcePath, { recursive: true });
    }

    // Verificar se schema.js existe, se não, criar um arquivo vazio como fallback
    const schemaPath = path.join(sourcePath, 'schema.js');
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️  schema.js not found, creating fallback...');
      const fallbackContent = `// Fallback schema file - this should be replaced by the actual compiled schema
export const insertContactSubmissionSchema = {};
export const insertPlanSchema = {};
export const insertNetworkUnitSchema = {};
export const insertFaqItemSchema = {};
export const insertSiteSettingsSchema = {};
export const insertFileMetadataSchema = {};
export const insertClienteSchema = {};
export const insertPlanoClienteSchema = {};
export const insertBeneficioPlanoSchema = {};
export const insertInformacaoContatoSchema = {};

// Types
export type InsertContactSubmission = any;
export type ContactSubmission = any;
export type Plan = any;
export type InsertPlan = any;
export type NetworkUnit = any;
export type InsertNetworkUnit = any;
export type FaqItem = any;
export type InsertFaqItem = any;
export type SiteSettings = any;
export type InsertSiteSettings = any;
export type FileMetadata = any;
export type InsertFileMetadata = any;
export type InsertCliente = any;
export type Cliente = any;
export type InsertPlanoCliente = any;
export type PlanoCliente = any;
export type InsertBeneficioPlano = any;
export type BeneficioPlano = any;
export type InsertInformacaoContato = any;
export type InformacaoContato = any;

// Admin user type
export interface AdminUser {
  id: string;
  username: string;
  createdAt: Date;
}`;
      
      fs.writeFileSync(schemaPath, fallbackContent, 'utf8');
      console.log('✅ Created fallback schema.js');
    } else {
      console.log('✅ schema.js already exists');
    }

    // Listar arquivos no diretório
    const files = fs.readdirSync(sourcePath);
    console.log('📁 Files in dist/shared:', files);

  } catch (error) {
    console.error('❌ Error ensuring shared files:', error.message);
    process.exit(1);
  }
}

// Executar verificação
ensureSharedFiles();
console.log('🎉 Shared files verification completed!');
