import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { dbHealthManager } from '../db.js';

// Interface para erros estruturados
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: any;
  timestamp?: Date;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
}

// Classe para erros operacionais
export class OperationalError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    this.timestamp = new Date();

    // Garantir que o stack trace seja preservado
    Error.captureStackTrace(this, this.constructor);
  }
}

// Classe para erros de validação
export class ValidationError extends OperationalError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

// Classe para erros de autenticação
export class AuthenticationError extends OperationalError {
  constructor(message: string = 'Autenticação requerida') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// Classe para erros de autorização
export class AuthorizationError extends OperationalError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// Classe para erros de recurso não encontrado
export class NotFoundError extends OperationalError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

// Classe para erros de conflito
export class ConflictError extends OperationalError {
  constructor(message: string = 'Conflito de dados') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// Classe para erros de rate limiting
export class RateLimitError extends OperationalError {
  constructor(message: string = 'Muitas requisições') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// Sistema de logging estruturado
class ErrorLogger {
  private static instance: ErrorLogger;
  private errorCount: Map<string, number> = new Map();
  private readonly maxErrorsPerMinute = 100;

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(error: AppError, req: Request): void {
    const errorKey = `${error.code}:${req.path}`;
    const currentCount = this.errorCount.get(errorKey) || 0;
    
    // Limitar logs de erro para evitar spam
    if (currentCount < this.maxErrorsPerMinute) {
      this.errorCount.set(errorKey, currentCount + 1);
      
      const errorLog = {
        timestamp: error.timestamp || new Date(),
        level: 'ERROR',
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        statusCode: error.statusCode || 500,
        path: req.path,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        requestId: (req as any).id,
        details: error.details,
        stack: error.stack,
        isOperational: error.isOperational,
        databaseHealth: dbHealthManager.isDatabaseHealthy(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };

      // Log estruturado para produção
      if (process.env.NODE_ENV === 'production') {
        console.error(JSON.stringify(errorLog));
      } else {
        // Log detalhado para desenvolvimento
        console.error('🚨 ERRO DETECTADO:');
        console.error('   Código:', errorLog.code);
        console.error('   Status:', errorLog.statusCode);
        console.error('   Mensagem:', errorLog.message);
        console.error('   Path:', errorLog.path);
        console.error('   Método:', errorLog.method);
        console.error('   IP:', errorLog.ip);
        console.error('   Usuário:', errorLog.userId || 'N/A');
        console.error('   Banco saudável:', errorLog.databaseHealth);
        if (errorLog.details) {
          console.error('   Detalhes:', errorLog.details);
        }
        if (errorLog.stack) {
          console.error('   Stack:', errorLog.stack);
        }
      }

      // Reset contador a cada minuto
      setTimeout(() => {
        this.errorCount.set(errorKey, Math.max(0, (this.errorCount.get(errorLog.code) || 0) - 1));
      }, 60000);
    }
  }

  public logWarning(message: string, req: Request, details?: any): void {
    const warningLog = {
      timestamp: new Date(),
      level: 'WARN',
      message,
      path: req.path,
      method: req.method,
      details
    };

    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify(warningLog));
    } else {
      console.warn('⚠️ AVISO:', message, details ? `(${JSON.stringify(details)})` : '');
    }
  }
}

// Instância global do logger
const errorLogger = ErrorLogger.getInstance();

// Middleware para capturar erros de validação Zod
export const handleZodError = (error: ZodError): AppError => {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return new ValidationError('Dados de entrada inválidos', details);
};

// Middleware para capturar erros de sintaxe JSON
export const handleJsonError = (error: SyntaxError): AppError => {
  return new ValidationError('JSON inválido no corpo da requisição', {
    originalError: error.message
  });
};

// Middleware para capturar erros de timeout
export const handleTimeoutError = (error: Error): AppError => {
  return new OperationalError(
    'Operação excedeu o tempo limite',
    408,
    'TIMEOUT_ERROR',
    { originalError: error.message }
  );
};

// Middleware para capturar erros de banco de dados
export const handleDatabaseError = (error: any): AppError => {
  // Erros específicos do PostgreSQL
  if (error.code === '23505') { // unique_violation
    return new ConflictError('Dados duplicados detectados');
  }
  if (error.code === '23503') { // foreign_key_violation
    return new ValidationError('Referência inválida');
  }
  if (error.code === '23502') { // not_null_violation
    return new ValidationError('Campo obrigatório não preenchido');
  }
  if (error.code === '42P01') { // undefined_table
    return new OperationalError('Tabela não encontrada', 500, 'DATABASE_ERROR');
  }
  if (error.code === '42P02') { // undefined_column
    return new OperationalError('Coluna não encontrada', 500, 'DATABASE_ERROR');
  }

  // Erros de conexão
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new OperationalError(
      'Serviço temporariamente indisponível',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  // Erro genérico de banco
  return new OperationalError(
    'Erro interno do banco de dados',
    500,
    'DATABASE_ERROR',
    { originalError: error.message }
  );
};

// Middleware principal de tratamento de erros
export const errorHandler = (
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Converter erro genérico para AppError se necessário
  let appError: AppError;
  
  if (error instanceof OperationalError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = handleZodError(error);
  } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
    appError = handleJsonError(error);
  } else if (error.name === 'TimeoutError') {
    appError = handleTimeoutError(error);
  } else if (error.code && typeof error.code === 'string') {
    // Erro de banco de dados ou outro erro com código
    appError = handleDatabaseError(error);
  } else {
    // Erro genérico
    appError = new OperationalError(
      error.message || 'Erro interno do servidor',
      500,
      'INTERNAL_ERROR'
    );
  }

  // Adicionar informações da requisição
  appError.path = req.path;
  appError.method = req.method;
  appError.userAgent = req.get('User-Agent');
  appError.ip = req.ip || req.connection.remoteAddress;
  appError.userId = (req as any).user?.id;
  appError.requestId = (req as any).id;

  // Log do erro
  errorLogger.logError(appError, req);

  // Resposta para o cliente
  const response: any = {
    error: {
      code: appError.code,
      message: appError.message,
      timestamp: appError.timestamp
    }
  };

  // Incluir detalhes apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development' && appError.details) {
    response.error.details = appError.details;
  }

  // Incluir requestId se disponível
  if (appError.requestId) {
    response.error.requestId = appError.requestId;
  }

  // Headers de segurança
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });

  // Status code
  const statusCode = appError.statusCode || 500;
  res.status(statusCode).json(response);

  // Log de warning para erros operacionais frequentes
  if (appError.isOperational && statusCode >= 400 && statusCode < 500) {
    errorLogger.logWarning(
      `Erro operacional frequente: ${appError.code}`,
      req,
      { count: 1 }
    );
  }
};

// Middleware para capturar erros não tratados
export const unhandledErrorHandler = (): void => {
  process.on('uncaughtException', (error: Error) => {
    console.error('🚨 EXCEÇÃO NÃO CAPTURADA:', error);
    console.error('Stack trace:', error.stack);
    
    // Em produção, você pode querer notificar um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Implementar notificação para serviço de monitoramento
      console.error('Notificando serviço de monitoramento...');
    }
    
    // Encerrar processo graciosamente
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('🚨 PROMISE REJECTION NÃO TRATADA:', reason);
    console.error('Promise:', promise);
    
    // Em produção, você pode querer notificar um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Implementar notificação para serviço de monitoramento
      console.error('Notificando serviço de monitoramento...');
    }
  });
};

// Middleware para validação de entrada
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(handleZodError(error));
      } else {
        next(error);
      }
    }
  };
};

// Middleware para rate limiting inteligente
export const intelligentRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const requestData = requestCounts.get(key);
    
    if (!requestData || now > requestData.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + options.windowMs });
    } else {
      requestData.count++;
      
      if (requestData.count > options.max) {
        const error = new RateLimitError(options.message);
        return next(error);
      }
    }
    
    next();
  };
};

// Middleware para health check
export const healthCheck = (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbHealthManager.isDatabaseHealthy(),
    environment: process.env.NODE_ENV || 'development'
  };

  const statusCode = health.database ? 200 : 503;
  res.status(statusCode).json(health);
};
