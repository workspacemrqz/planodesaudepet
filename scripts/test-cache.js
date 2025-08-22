#!/usr/bin/env node

/**
 * Script de teste para validar funcionalidades anti-cache
 * Executa testes sistemáticos para verificar se o cache está funcionando corretamente
 */

import http from 'http';
import https from 'https';

// Configuração
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  testRoutes: [
    '/',
    '/planos',
    '/sobre',
    '/contato',
    '/faq',
    '/rede-credenciada',
    '/api/site-settings',
    '/api/plans',
    '/api/network-units',
    '/api/faq',
  ],
  expectedHeaders: [
    'cache-control',
    'pragma',
    'expires',
    'x-no-cache',
    'x-build-time'
  ]
};

// Função para fazer requisição HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: config.timeout,
      ...options
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Função para testar headers anti-cache
function testAntiCacheHeaders(headers, route) {
  console.log(`\n🔍 Testando headers anti-cache para: ${route}`);
  
  const results = {
    route,
    passed: true,
    issues: [],
    headers: {}
  };

  // Verificar headers obrigatórios
  config.expectedHeaders.forEach(header => {
    const value = headers[header];
    results.headers[header] = value;
    
    if (!value) {
      results.passed = false;
      results.issues.push(`Header '${header}' não encontrado`);
    } else if (header === 'cache-control' && !value.includes('no-cache')) {
      results.passed = false;
      results.issues.push(`Header 'cache-control' não contém 'no-cache': ${value}`);
    } else if (header === 'pragma' && value !== 'no-cache') {
      results.passed = false;
      results.issues.push(`Header 'pragma' incorreto: ${value}`);
    } else if (header === 'expires' && value !== '0') {
      results.passed = false;
      results.issues.push(`Header 'expires' incorreto: ${value}`);
    }
  });

  // Verificar se não há headers de cache longo
  const cacheControl = headers['cache-control'];
  if (cacheControl && cacheControl.includes('max-age=')) {
    const maxAge = cacheControl.match(/max-age=(\d+)/);
    if (maxAge && parseInt(maxAge[1]) > 0) {
      results.passed = false;
      results.issues.push(`Header 'cache-control' contém max-age > 0: ${cacheControl}`);
    }
  }

  // Exibir resultados
  if (results.passed) {
    console.log(`✅ Headers anti-cache OK para ${route}`);
  } else {
    console.log(`❌ Headers anti-cache FALHARAM para ${route}:`);
    results.issues.forEach(issue => console.log(`   - ${issue}`));
  }

  console.log(`   Headers encontrados:`, results.headers);
  
  return results;
}

// Função para testar cache busting
async function testCacheBusting(baseUrl) {
  console.log('\n🔄 Testando cache busting...');
  
  try {
    // Fazer duas requisições para a mesma rota
    const response1 = await makeRequest(`${baseUrl}/api/site-settings`);
    const response2 = await makeRequest(`${baseUrl}/api/site-settings`);
    
    // Verificar se os timestamps são diferentes
    const timestamp1 = response1.headers['x-request-timestamp'];
    const timestamp2 = response2.headers['x-request-timestamp'];
    
    if (timestamp1 && timestamp2 && timestamp1 !== timestamp2) {
      console.log('✅ Cache busting funcionando - timestamps diferentes');
      console.log(`   Timestamp 1: ${timestamp1}`);
      console.log(`   Timestamp 2: ${timestamp2}`);
    } else {
      console.log('❌ Cache busting falhou - timestamps iguais ou ausentes');
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar cache busting:', error.message);
  }
}

// Função para testar performance
async function testPerformance(baseUrl) {
  console.log('\n⚡ Testando performance...');
  
  const testRoute = '/api/site-settings';
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      await makeRequest(`${baseUrl}${testRoute}`);
      const duration = Date.now() - start;
      times.push(duration);
      console.log(`   Requisição ${i + 1}: ${duration}ms`);
    } catch (error) {
      console.log(`   Requisição ${i + 1}: ERRO - ${error.message}`);
    }
  }
  
  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log(`   Média: ${avg.toFixed(2)}ms`);
    console.log(`   Min: ${min}ms`);
    console.log(`   Max: ${max}ms`);
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes de cache...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Timeout: ${config.timeout}ms`);
  
  const results = [];
  
  try {
    // Testar cada rota
    for (const route of config.testRoutes) {
      try {
        const response = await makeRequest(`${config.baseUrl}${route}`);
        
        if (response.statusCode === 200) {
          const result = testAntiCacheHeaders(response.headers, route);
          results.push(result);
        } else {
          console.log(`⚠️  Rota ${route} retornou status ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ Erro ao testar rota ${route}: ${error.message}`);
        results.push({
          route,
          passed: false,
          issues: [`Erro de conexão: ${error.message}`],
          headers: {}
        });
      }
    }
    
    // Testes adicionais
    await testCacheBusting(config.baseUrl);
    await testPerformance(config.baseUrl);
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES:');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    console.log(`Total de rotas testadas: ${total}`);
    console.log(`✅ Passaram: ${passed}`);
    console.log(`❌ Falharam: ${total - passed}`);
    
    if (passed === total) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Cache anti-cache funcionando perfeitamente.');
    } else {
      console.log('\n⚠️  Alguns testes falharam. Verifique a configuração do servidor.');
    }
    
  } catch (error) {
    console.error('💥 Erro fatal durante os testes:', error);
    process.exit(1);
  }
}

// Executar testes se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  runTests,
  testAntiCacheHeaders,
  testCacheBusting,
  testPerformance
};
