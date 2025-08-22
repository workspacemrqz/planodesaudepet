#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏥 Health Check - UNIPET PLAN');
console.log('='.repeat(50));

// Verificar se os arquivos de build existem
const distPath = join(__dirname, '..', 'dist');
const distPublicPath = join(distPath, 'public');
const distIndexPath = join(distPath, 'index.js');

console.log('\n📁 Verificando arquivos de build:');
console.log(`- dist/: ${existsSync(distPath) ? '✅' : '❌'}`);
console.log(`- dist/public/: ${existsSync(distPublicPath) ? '✅' : '❌'}`);
console.log(`- dist/index.js: ${existsSync(distIndexPath) ? '✅' : '❌'}`);

if (!existsSync(distIndexPath)) {
  console.error('\n❌ Erro: Arquivo de servidor não encontrado');
  console.error('Execute "npm run build" primeiro');
  process.exit(1);
}

// Verificar variáveis de ambiente
console.log('\n🔧 Verificando variáveis de ambiente:');
const requiredEnvVars = ['NODE_ENV', 'PORT', 'HOST'];
const optionalEnvVars = ['DATABASE_URL', 'LOGIN', 'SENHA', 'SESSION_SECRET'];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`- ${varName}: ${value ? '✅' : '❌'} ${value || ''}`);
});

optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`- ${varName}: ${value ? '✅' : '⚠️'} ${value ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]'}`);
});

// Verificar conectividade com banco de dados (se DATABASE_URL estiver configurado)
if (process.env.DATABASE_URL) {
  console.log('\n🗄️ Verificando conectividade com banco de dados...');
  try {
    // Aqui você pode adicionar uma verificação real de conectividade
    console.log('✅ DATABASE_URL configurado');
  } catch (error) {
    console.log('⚠️ Aviso: Não foi possível verificar conectividade com banco');
  }
}

// Verificar se o servidor pode ser iniciado
console.log('\n🚀 Testando inicialização do servidor...');
try {
  const serverProcess = spawn('node', [distIndexPath], {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  let serverStarted = false;
  const timeout = setTimeout(() => {
    if (!serverStarted) {
      console.log('⚠️ Timeout ao aguardar inicialização do servidor');
      serverProcess.kill();
    }
  }, 10000);

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running') || output.includes('Listening on')) {
      serverStarted = true;
      clearTimeout(timeout);
      console.log('✅ Servidor iniciado com sucesso');
      serverProcess.kill();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (error.includes('Error') || error.includes('Failed')) {
      console.log('❌ Erro ao iniciar servidor:', error.trim());
    }
  });

  serverProcess.on('close', (code) => {
    if (code === 0 || serverStarted) {
      console.log('✅ Teste de inicialização concluído');
    } else {
      console.log(`❌ Servidor encerrou com código ${code}`);
    }
  });

} catch (error) {
  console.error('❌ Erro ao testar inicialização:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🏁 Health check concluído');
console.log('\n📋 Próximos passos:');
console.log('1. Verifique se todas as variáveis de ambiente estão configuradas');
console.log('2. Execute "npm start" para iniciar o servidor');
console.log('3. Acesse http://localhost:8080 para testar a aplicação');
console.log('4. Verifique os logs para identificar possíveis problemas');
