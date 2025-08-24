import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { sanitizeText } from '../utils/text-sanitizer.js';

// Interface para configurações de segurança
interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableRateLimit: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  maxRequestSize: string;
  allowedOrigins: string[];
  trustedProxies: string[];
}

// Configuração padrão de segurança
const defaultSecurityConfig: SecurityConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableRateLimit: true,
  enableInputValidation: true,
  enableXSSProtection: true,
  enableCSRFProtection: true,
  maxRequestSize: '10mb',
  allowedOrigins: ['*'], // Em produção, especificar domínios específicos
  trustedProxies: ['127.0.0.1', '::1', 'localhost']
};

// Classe para gerenciar configurações de segurança
class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivity: Map<string, { count: number; lastAttempt: number }> = new Map();

  private constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config };
    this.initializeSecurity();
  }

  public static getInstance(config?: Partial<SecurityConfig>): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager(config);
    }
    return SecurityManager.instance;
  }

  private initializeSecurity(): void {
    // Limpar IPs bloqueados a cada hora
    setInterval(() => {
      this.blockedIPs.clear();
      this.suspiciousActivity.clear();
    }, 3600000); // 1 hora
  }

  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  public blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip);
    console.log(`🚫 IP bloqueado: ${ip} - Motivo: ${reason}`);
  }

  public recordSuspiciousActivity(ip: string, activity: string): void {
    const now = Date.now();
    const existing = this.suspiciousActivity.get(ip);
    
    if (existing) {
      existing.count++;
      existing.lastAttempt = now;
      
      // Bloquear IP se muitas atividades suspeitas
      if (existing.count > 10) {
        this.blockIP(ip, `Muitas atividades suspeitas: ${existing.count}`);
      }
    } else {
      this.suspiciousActivity.set(ip, { count: 1, lastAttempt: now });
    }
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// Instância global do gerenciador de segurança
const securityManager = SecurityManager.getInstance();

// Middleware para adicionar ID único à requisição
export const addRequestId = (req: Request, res: Response, next: NextFunction): void => {
  (req as any).id = randomUUID();
  res.setHeader('X-Request-ID', (req as any).id);
  next();
};

// Middleware para configurar proxy trust
export const configureProxyTrust = (req: Request, res: Response, next: NextFunction): void => {
  // Configurar confiança em proxies para obter IP real
  const realIp = req.headers['x-forwarded-for'] as string || 
                 req.headers['x-real-ip'] as string || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 'unknown';
  
  // Usar Object.defineProperty para definir req.ip
  Object.defineProperty(req, 'ip', {
    value: realIp,
    writable: false,
    configurable: false
  });
  
  next();
};

// Middleware para headers de segurança
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  const config = securityManager.getConfig();

  // Content Security Policy
  if (config.enableCSP) {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '));
  }

  // HTTP Strict Transport Security
  if (config.enableHSTS) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // XSS Protection
  if (config.enableXSSProtection) {
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  // Outros headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remover headers que podem expor informações
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
};

// Middleware para validação de origem (CORS)
export const corsValidation = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  const config = securityManager.getConfig();

  if (origin && !config.allowedOrigins.includes('*')) {
    if (!config.allowedOrigins.includes(origin)) {
      securityManager.recordSuspiciousActivity(req.ip, `Origem não permitida: ${origin}`);
      res.status(403).json({ error: 'Origem não permitida' });
      return;
    }
  }

  // Configurar CORS
  res.header('Access-Control-Allow-Origin', config.allowedOrigins.includes('*') ? '*' : origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

// Middleware para proteção contra ataques de força bruta
export const bruteForceProtection = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip;
  
  // Verificar se IP está bloqueado
  if (securityManager.isIPBlocked(ip)) {
    res.status(403).json({ 
      error: 'Acesso temporariamente bloqueado',
      retryAfter: 3600 // 1 hora
    });
    return;
  }

  // Verificar atividades suspeitas
  const suspicious = securityManager['suspiciousActivity'].get(ip);
  if (suspicious && suspicious.count > 5) {
    const timeSinceLastAttempt = Date.now() - suspicious.lastAttempt;
    if (timeSinceLastAttempt < 300000) { // 5 minutos
      res.status(429).json({ 
        error: 'Muitas tentativas, aguarde antes de tentar novamente',
        retryAfter: Math.ceil((300000 - timeSinceLastAttempt) / 1000)
      });
      return;
    }
  }

  next();
};

// Middleware para validação de entrada
export const inputValidation = (req: Request, res: Response, next: NextFunction): void => {
  const config = securityManager.getConfig();
  
  if (!config.enableInputValidation) {
    return next();
  }

  try {
    // Validar tamanho da requisição
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = parseInt(config.maxRequestSize.replace('mb', '000000'));
    
    if (contentLength > maxSize) {
      securityManager.recordSuspiciousActivity(req.ip, `Requisição muito grande: ${contentLength} bytes`);
      res.status(413).json({ error: 'Requisição muito grande' });
      return;
    }

    // Sanitizar parâmetros da URL
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeText(req.query[key] as string);
        }
      });
    }

    // Sanitizar parâmetros da rota
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeText(req.params[key]);
        }
      });
    }

    // Sanitizar corpo da requisição (apenas strings)
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    securityManager.recordSuspiciousActivity(req.ip, `Erro na validação de entrada: ${error}`);
    res.status(400).json({ error: 'Dados de entrada inválidos' });
  }
};

// Função para sanitizar objetos recursivamente
function sanitizeObject(obj: any): void {
  if (typeof obj === 'string') {
    sanitizeText(obj);
    return;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach(item => sanitizeObject(item));
    return;
  }
  
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeText(obj[key]);
      } else if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    });
  }
}

// Middleware para proteção contra SQL Injection
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sqlPatterns = [
    /(\b(select|insert|update|delete|drop|create|alter|exec|union|script|javascript|vbscript|onload|onerror|onclick)\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bfrom\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bwhere\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bor\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\band\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bunion\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bselect\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\binsert\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bupdate\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bdelete\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bdrop\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bcreate\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\balter\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bexec\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bscript\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bjavascript\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bvbscript\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bonload\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bonerror\b)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter|exec)\s+.*\bonclick\b)/i
  ];

  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(item => checkForSQLInjection(item));
    }
    
    if (value && typeof value === 'object') {
      return Object.values(value).some(val => checkForSQLInjection(val));
    }
    
    return false;
  };

  // Verificar query parameters
  if (checkForSQLInjection(req.query)) {
    securityManager.recordSuspiciousActivity(req.ip, 'Tentativa de SQL Injection detectada');
    res.status(400).json({ error: 'Dados de entrada inválidos' });
    return;
  }

  // Verificar parâmetros da rota
  if (checkForSQLInjection(req.params)) {
    securityManager.recordSuspiciousActivity(req.ip, 'Tentativa de SQL Injection detectada');
    res.status(400).json({ error: 'Dados de entrada inválidos' });
    return;
  }

  // Verificar corpo da requisição
  if (checkForSQLInjection(req.body)) {
    securityManager.recordSuspiciousActivity(req.ip, 'Tentativa de SQL Injection detectada');
    res.status(400).json({ error: 'Dados de entrada inválidos' });
    return;
  }

  next();
};

// Middleware para proteção contra XSS
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onreset\s*=/gi,
    /onselect\s*=/gi,
    /onunload\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /<input\b[^<]*(?:(?!<\/input>)<[^<]*)*>/gi,
    /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
    /<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi,
    /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
    /<label\b[^<]*(?:(?!<\/label>)<[^<]*)*<\/label>/gi,
    /<fieldset\b[^<]*(?:(?!<\/fieldset>)<[^<]*)*<\/fieldset>/gi,
    /<legend\b[^<]*(?:(?!<\/legend>)<[^<]*)*<\/legend>/gi,
    /<optgroup\b[^<]*(?:(?!<\/optgroup>)<[^<]*)*<\/optgroup>/gi,
    /<option\b[^<]*(?:(?!<\/option>)<[^<]*)*<\/option>/gi
  ];

  const checkForXSS = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(item => checkForXSS(item));
    }
    
    if (value && typeof value === 'object') {
      return Object.values(value).some(val => checkForXSS(val));
    }
    
    return false;
  };

  // Verificar query parameters
  if (checkForXSS(req.query)) {
    securityManager.recordSuspiciousActivity(req.ip, 'Tentativa de XSS detectada');
    res.status(400).json({ error: 'Dados de entrada inválidos' });
    return;
  }

  // Verificar parâmetros da rota
  if (checkForXSS(req.params)) {
    securityManager.recordSuspiciousActivity(req.ip, 'Tentativa de XSS detectada');
    res.status(400).json({ error: 'Dados de entrada inválidos' });
    return;
  }

  // Verificar corpo da requisição
  if (checkForXSS(req.body)) {
    securityManager.recordSuspiciousActivity(req.ip, 'Tentativa de XSS detectada');
    res.status(400).json({ error: 'Dados de entrada inválidos' });
    return;
  }

  next();
};

// Middleware para logging de segurança
export const securityLogging = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log da requisição
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: (req as any).id,
      userId: (req as any).user?.id
    };

    // Log de atividades suspeitas
    if (res.statusCode >= 400) {
      securityManager.recordSuspiciousActivity(req.ip, `Status ${res.statusCode} em ${req.path}`);
    }

    // Log estruturado para produção
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData));
    } else {
      console.log(`🔒 [SECURITY] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    }
  });

  next();
};

// Middleware para rate limiting baseado em IP
export const rateLimitByIP = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const requestCounts = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    
    const requestData = requestCounts.get(ip);
    
    if (!requestData || now > requestData.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + options.windowMs, blocked: false });
    } else {
      requestData.count++;
      
      if (requestData.count > options.max) {
        requestData.blocked = true;
        securityManager.recordSuspiciousActivity(ip, `Rate limit excedido: ${requestData.count} requests`);
        
        res.status(429).json({ 
          error: options.message || 'Muitas requisições',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
        return;
      }
    }
    
    next();
  };
};

// Middleware para validação de tipo de conteúdo
export const contentTypeValidation = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      res.status(400).json({ error: 'Content-Type é obrigatório' });
      return;
    }
    
    const isValidType = allowedTypes.some(type => contentType.includes(type));
    if (!isValidType) {
      securityManager.recordSuspiciousActivity(req.ip, `Content-Type não permitido: ${contentType}`);
      res.status(400).json({ error: 'Tipo de conteúdo não suportado' });
      return;
    }
    
    next();
  };
};

// Middleware para validação de tamanho de arquivo
export const fileSizeValidation = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      securityManager.recordSuspiciousActivity(req.ip, `Arquivo muito grande: ${contentLength} bytes`);
      res.status(413).json({ error: 'Arquivo muito grande' });
      return;
    }
    
    next();
  };
};

// Função para aplicar todos os middlewares de segurança
export const applySecurityMiddleware = (app: any, config?: Partial<SecurityConfig>) => {
  const security = SecurityManager.getInstance(config);
  
  // Middlewares de segurança em ordem de execução
  app.use(addRequestId);
  app.use(configureProxyTrust);
  app.use(securityHeaders);
  app.use(corsValidation);
  app.use(bruteForceProtection);
  app.use(inputValidation);
  app.use(sqlInjectionProtection);
  app.use(xssProtection);
  app.use(securityLogging);
  
  // Rate limiting global
  app.use(rateLimitByIP({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Muitas requisições deste IP'
  }));
  
  console.log('🔒 Middlewares de segurança aplicados com sucesso');
};

// Exportar instância do gerenciador de segurança
export { securityManager };
