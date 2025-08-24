#!/usr/bin/env node

/**
 * Script de Health Check para Easypanel
 * Verifica se a aplicação está funcionando corretamente
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Verificar se os arquivos de build existem
function checkBuildFiles() {
  const requiredFiles = [
    'dist/server/index.js',
    'dist/client/index.html'
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      console.error(`❌ Arquivo não encontrado: ${file}`);
      return false;
    }
  }
  return true;
}

// Verificar variáveis de ambiente críticas
function checkEnvironment() {
  const requiredVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'LOGIN',
    'SENHA',
    'SESSION_SECRET'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Variável de ambiente não definida: ${varName}`);
      return false;
    }
  }
  return true;
}

// Criar servidor de health check
const server = createServer((req, res) => {
  if (req.url === '/api/health') {
    const buildOk = checkBuildFiles();
    const envOk = checkEnvironment();
    
    if (buildOk && envOk) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        build: 'ok',
        environment: 'ok',
        uptime: process.uptime()
      }));
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        build: buildOk ? 'ok' : 'error',
        environment: envOk ? 'ok' : 'error'
      }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Health Check rodando em http://${HOST}:${PORT}/api/health`);
  console.log(`📁 Verificando arquivos de build...`);
  
  if (checkBuildFiles()) {
    console.log('✅ Arquivos de build encontrados');
  } else {
    console.log('❌ Arquivos de build não encontrados');
  }
  
  if (checkEnvironment()) {
    console.log('✅ Variáveis de ambiente configuradas');
  } else {
    console.log('❌ Variáveis de ambiente não configuradas');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Recebido SIGTERM, encerrando...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Recebido SIGINT, encerrando...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});
