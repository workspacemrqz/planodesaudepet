import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { autoConfig } from "./config.js";
import { initializeDatabase, closeDatabase } from "./db.js";
import { applySecurityMiddleware } from "./middleware/security.js";
import { errorHandler, unhandledErrorHandler, healthCheck } from "./middleware/error-handler.js";
import path from "path";

const app = express();

// Trust proxy para produção
app.set("trust proxy", 1);

// Aplicar middlewares de segurança
applySecurityMiddleware(app, {
  enableCSP: true,
  enableHSTS: true,
  enableRateLimit: true,
  enableInputValidation: true,
  enableXSSProtection: true,
  enableCSRFProtection: true,
  maxRequestSize: '10mb',
  allowedOrigins: process.env.NODE_ENV === 'production' 
    ? [process.env.ALLOWED_ORIGIN || 'https://unipetplan.com.br'] 
    : ['*'],
  trustedProxies: ['127.0.0.1', '::1', 'localhost', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
});

// Configure JSON parsing to preserve line breaks and special characters
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw buffer for potential custom parsing
    (req as any).rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb'
}));

// Logging middleware otimizado
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Health check route
app.get("/api/health", healthCheck);

// Função principal de inicialização
async function initializeServer(): Promise<void> {
  try {
    console.log('🚀 Inicializando servidor...');
    
    // 1. Inicializar banco de dados
    console.log('🔌 Inicializando banco de dados...');
    await initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso');
    
    // 2. Registrar rotas
    console.log('🛣️ Registrando rotas...');
    const server = await registerRoutes(app);
    console.log('✅ Rotas registradas com sucesso');
    
    // 3. Configurar tratamento de erros
    console.log('🛡️ Configurando tratamento de erros...');
    unhandledErrorHandler();
    
    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      errorHandler(err, _req, res, _next);
    });
    
    // 4. Configurar arquivos estáticos em produção
    if (process.env.NODE_ENV === 'production') {
      console.log('📁 Configurando arquivos estáticos...');
      const clientBuildPath = path.join(process.cwd(), 'dist', 'client');
      
      // Serve static assets com cache otimizado
      app.use('/assets', express.static(path.join(clientBuildPath, 'assets'), {
        maxAge: '1y',
        etag: true,
        lastModified: true,
        immutable: true
      }));
      
      // Serve the React app for all non-API routes
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(clientBuildPath, 'index.html'));
        }
      });
      
      console.log('✅ Arquivos estáticos configurados');
    }
    
    // 5. Iniciar servidor
    const port = parseInt(autoConfig.get('PORT'), 10);
    const host = autoConfig.get('HOST');
    
    server.listen(port, host, () => {
      console.log('\n🎉 SERVIDOR INICIADO COM SUCESSO!');
      console.log('=====================================');
      console.log(`🌐 URL: http://${host}:${port}`);
      console.log(`🏠 Host: ${host} (${host === '0.0.0.0' ? 'Aceita conexões externas' : 'Apenas localhost'})`);
      console.log(`🌍 Ambiente: ${autoConfig.get('NODE_ENV')}`);
      console.log(`📁 Diretório: ${process.cwd()}`);
      console.log(`🔌 Banco: Conectado e saudável`);
      console.log(`🛡️ Segurança: Ativa e configurada`);
      console.log(`📊 Health Check: /api/health`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`📦 Modo: Produção - arquivos estáticos servidos de dist/client`);
        console.log(`🔒 HTTPS: Recomendado para produção`);
      } else {
        console.log(`🔧 Modo: Desenvolvimento`);
        console.log(`📝 Logs: Detalhados para debugging`);
      }
      
      console.log('=====================================\n');
    });
    
    // 6. Configurar graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Recebido ${signal}, encerrando graciosamente...`);
      
      try {
        // Fechar servidor HTTP
        server.close(() => {
          console.log('✅ Servidor HTTP fechado');
        });
        
        // Fechar conexões do banco
        await closeDatabase();
        
        console.log('✅ Encerramento gracioso concluído');
        process.exit(0);
      } catch (error) {
        console.error('❌ Erro durante encerramento:', error);
        process.exit(1);
      }
    };
    
    // Capturar sinais de encerramento
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
    
    // Capturar erros não tratados
    process.on('uncaughtException', (error) => {
      console.error('🚨 EXCEÇÃO NÃO CAPTURADA:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 PROMISE REJECTION NÃO TRATADA:', reason);
      console.error('Promise:', promise);
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    console.error('❌ FALHA NA INICIALIZAÇÃO DO SERVIDOR:', error);
    process.exit(1);
  }
}

// Inicializar servidor
initializeServer().catch((error) => {
  console.error('❌ ERRO CRÍTICO NA INICIALIZAÇÃO:', error);
  process.exit(1);
});
