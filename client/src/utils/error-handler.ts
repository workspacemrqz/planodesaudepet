import { getConfig } from '../config/app-config';

// Interface para erros estruturados
interface AppError extends Error {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stack?: string;
  isRecoverable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// Interface para configurações de tratamento de erro
interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableNotifications: boolean;
  enableErrorReporting: boolean;
  enableRecovery: boolean;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  ignoredErrors: string[];
  recoveryStrategies: Record<string, () => void>;
}

// Configuração padrão do handler de erros
const defaultConfig: ErrorHandlerConfig = {
  enableLogging: true,
  enableNotifications: true,
  enableErrorReporting: true,
  enableRecovery: true,
  maxRetries: 3,
  retryDelay: 1000,
  logLevel: 'error',
  ignoredErrors: [
    'ResizeObserver loop limit exceeded',
    'Script error.',
    'Network Error',
    'Failed to fetch'
  ],
  recoveryStrategies: {}
};

// Classe principal do handler de erros
class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorCount: Map<string, number> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private isInitialized: boolean = false;

  private constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initialize();
  }

  public static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Capturar erros globais não tratados
      this.setupGlobalErrorHandlers();
      
      // Configurar listeners para diferentes tipos de erro
      this.setupEventListeners();
      
      // Configurar recovery automático
      if (this.config.enableRecovery) {
        this.setupRecoveryStrategies();
      }

      this.isInitialized = true;
      console.log('🛡️ Error Handler inicializado com sucesso');
    } catch (error) {
      console.error('❌ Falha na inicialização do Error Handler:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Capturar erros de JavaScript
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Capturar erros de Promise não tratados
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        type: 'promise',
        reason: event.reason
      });
    });

    // Capturar erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.handleError(new Error(`Resource error: ${event.target}`), {
          type: 'resource',
          target: event.target,
          src: (event.target as any).src || (event.target as any).href
        });
      }
    }, true);
  }

  private setupEventListeners(): void {
    // Capturar erros de navegação
    window.addEventListener('popstate', () => {
      this.logInfo('Navegação detectada', { type: 'navigation' });
    });

    // Capturar erros de rede
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          this.logInfo('Mudança na conexão detectada', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          });
        });
      }
    }

    // Capturar erros de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logInfo('Página oculta', { timestamp: new Date().toISOString() });
      } else {
        this.logInfo('Página visível', { timestamp: new Date().toISOString() });
      }
    });
  }

  private setupRecoveryStrategies(): void {
    // Estratégias de recovery padrão
    this.config.recoveryStrategies = {
      'network': () => {
        this.logInfo('Tentando recovery de rede...');
        // Implementar lógica de retry para requisições
      },
      'memory': () => {
        this.logInfo('Tentando recovery de memória...');
        // Limpar caches e liberar memória
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
      },
      'storage': () => {
        this.logInfo('Tentando recovery de storage...');
        // Limpar storage corrompido
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          this.logError('Falha ao limpar storage', error);
        }
      },
      'component': () => {
        this.logInfo('Tentando recovery de componente...');
        // Recarregar componente ou página
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
  }

  /**
   * Tratar erro principal
   */
  public handleError(error: Error | string, context?: Record<string, any>): void {
    try {
      const appError = this.createAppError(error, context);
      
      // Verificar se o erro deve ser ignorado
      if (this.shouldIgnoreError(appError)) {
        return;
      }

      // Registrar erro
      this.recordError(appError);

      // Log do erro
      if (this.config.enableLogging) {
        this.logError(appError);
      }

      // Notificação para o usuário
      if (this.config.enableNotifications) {
        this.showUserNotification(appError);
      }

      // Reportar erro
      if (this.config.enableErrorReporting) {
        this.reportError(appError);
      }

      // Tentar recovery automático
      if (this.config.enableRecovery && appError.isRecoverable) {
        this.attemptRecovery(appError);
      }

    } catch (handlerError) {
      console.error('❌ Erro no Error Handler:', handlerError);
      // Fallback para console
      console.error('Erro original:', error);
    }
  }

  /**
   * Criar erro estruturado
   */
  private createAppError(error: Error | string, context?: Record<string, any>): AppError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? new Error(error) : error;

    const appError: AppError = {
      name: originalError.name || 'AppError',
      message: errorMessage,
      code: this.determineErrorCode(originalError),
      severity: this.determineSeverity(originalError),
      context: {
        ...context,
        originalError: originalError.message,
        stack: originalError.stack
      },
      timestamp: new Date(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: originalError.stack,
      isRecoverable: this.isErrorRecoverable(originalError),
      retryCount: 0,
      maxRetries: this.config.maxRetries
    };

    return appError;
  }

  /**
   * Determinar código do erro
   */
  private determineErrorCode(error: Error): string {
    if (error.name === 'TypeError') return 'TYPE_ERROR';
    if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
    if (error.name === 'SyntaxError') return 'SYNTAX_ERROR';
    if (error.name === 'RangeError') return 'RANGE_ERROR';
    if (error.message.includes('Network')) return 'NETWORK_ERROR';
    if (error.message.includes('fetch')) return 'FETCH_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('permission')) return 'PERMISSION_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Determinar severidade do erro
   */
  private determineSeverity(error: Error): AppError['severity'] {
    if (error.name === 'SyntaxError') return 'critical';
    if (error.name === 'ReferenceError') return 'high';
    if (error.message.includes('Network')) return 'medium';
    if (error.message.includes('timeout')) return 'medium';
    
    return 'low';
  }

  /**
   * Verificar se o erro é recuperável
   */
  private isErrorRecoverable(error: Error): boolean {
    if (error.name === 'SyntaxError') return false;
    if (error.name === 'ReferenceError') return false;
    if (error.message.includes('Network')) return true;
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('fetch')) return true;
    
    return true;
  }

  /**
   * Verificar se o erro deve ser ignorado
   */
  private shouldIgnoreError(error: AppError): boolean {
    return this.config.ignoredErrors.some(ignored => 
      error.message.includes(ignored) || error.code.includes(ignored)
    );
  }

  /**
   * Registrar erro para estatísticas
   */
  private recordError(error: AppError): void {
    const errorKey = `${error.code}:${error.severity}`;
    const currentCount = this.errorCount.get(errorKey) || 0;
    this.errorCount.set(errorKey, currentCount + 1);

    // Limpar contadores antigos a cada hora
    setTimeout(() => {
      const count = this.errorCount.get(errorKey) || 0;
      if (count > 0) {
        this.errorCount.set(errorKey, Math.max(0, count - 1));
      }
    }, 3600000);
  }

  /**
   * Log do erro
   */
  private logError(error: AppError): void {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      level: 'ERROR',
      code: error.code,
      severity: error.severity,
      message: error.message,
      url: error.url,
      userId: error.userId,
      context: error.context,
      stack: error.stack
    };

    if (getConfig().features.enableAnalytics) {
      console.error('🚨 ERRO DETECTADO:', logData);
    } else {
      console.error('🚨 ERRO:', error.message);
      if (error.context) {
        console.error('Contexto:', error.context);
      }
    }
  }

  /**
   * Mostrar notificação para o usuário
   */
  private showUserNotification(error: AppError): void {
    // Implementar notificação baseada na severidade
    const notification = this.createNotificationElement(error);
    
    if (notification) {
      document.body.appendChild(notification);
      
      // Remover automaticamente após 5 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }

  /**
   * Criar elemento de notificação
   */
  private createNotificationElement(error: AppError): HTMLElement | null {
    if (error.severity === 'low') return null; // Não mostrar erros de baixa severidade

    const notification = document.createElement('div');
    notification.className = `error-notification error-${error.severity}`;
    notification.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <div class="error-title">${this.getErrorMessage(error)}</div>
        ${error.severity === 'critical' ? '<div class="error-action">Recarregando página...</div>' : ''}
      </div>
      <button class="error-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Estilos inline para garantir funcionamento
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getSeverityColor(error.severity)};
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    `;

    return notification;
  }

  /**
   * Obter cor baseada na severidade
   */
  private getSeverityColor(severity: AppError['severity']): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  }

  /**
   * Obter mensagem amigável para o usuário
   */
  private getErrorMessage(error: AppError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Problema de conexão detectado. Verificando...';
      case 'TIMEOUT_ERROR':
        return 'Operação demorou mais que o esperado. Tentando novamente...';
      case 'FETCH_ERROR':
        return 'Erro ao carregar dados. Verificando conexão...';
      case 'PERMISSION_ERROR':
        return 'Permissão negada. Verificando configurações...';
      default:
        return 'Ocorreu um erro inesperado. Tentando resolver...';
    }
  }

  /**
   * Reportar erro para serviço externo
   */
  private reportError(error: AppError): void {
    try {
      // Implementar envio para serviço de monitoramento
      if (getConfig().features.enableErrorReporting) {
        // Exemplo: Sentry, LogRocket, etc.
        console.log('📊 Enviando erro para serviço de monitoramento:', error.code);
      }
    } catch (reportError) {
      console.error('❌ Falha ao reportar erro:', reportError);
    }
  }

  /**
   * Tentar recovery automático
   */
  private attemptRecovery(error: AppError): void {
    const recoveryKey = error.code;
    const attempts = this.recoveryAttempts.get(recoveryKey) || 0;

    if (attempts >= this.config.maxRetries) {
      this.logError(new Error(`Máximo de tentativas de recovery atingido para ${error.code}`));
      return;
    }

    this.recoveryAttempts.set(recoveryKey, attempts + 1);

    // Aguardar antes de tentar recovery
    setTimeout(() => {
      const strategy = this.config.recoveryStrategies[recoveryKey];
      if (strategy) {
        try {
          strategy();
          this.logInfo(`Recovery executado para ${error.code}`, { attempt: attempts + 1 });
        } catch (recoveryError) {
          this.logError(new Error(`Falha no recovery para ${error.code}`), recoveryError);
        }
      }
    }, this.config.retryDelay * (attempts + 1));
  }

  /**
   * Log de informações
   */
  public logInfo(message: string, context?: Record<string, any>): void {
    if (this.config.logLevel === 'info' || this.config.logLevel === 'debug') {
      console.log('ℹ️ INFO:', message, context);
    }
  }

  /**
   * Log de avisos
   */
  public logWarning(message: string, context?: Record<string, any>): void {
    if (this.config.logLevel === 'warn' || this.config.logLevel === 'info' || this.config.logLevel === 'debug') {
      console.warn('⚠️ AVISO:', message, context);
    }
  }

  /**
   * Obter ID do usuário
   */
  private getUserId(): string | undefined {
    // Implementar lógica para obter ID do usuário
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Obter ID da sessão
   */
  private getSessionId(): string | undefined {
    // Implementar lógica para obter ID da sessão
    return sessionStorage.getItem('sessionId') || undefined;
  }

  /**
   * Obter estatísticas de erro
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errorCount.forEach((count, key) => {
      stats[key] = count;
    });
    return stats;
  }

  /**
   * Limpar estatísticas
   */
  public clearErrorStats(): void {
    this.errorCount.clear();
    this.recoveryAttempts.clear();
  }

  /**
   * Configurar handler
   */
  public configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ Error Handler reconfigurado');
  }

  /**
   * Parar handler
   */
  public stop(): void {
    this.isInitialized = false;
    console.log('🛑 Error Handler parado');
  }
}

// Instância global do error handler
export const errorHandler = ErrorHandler.getInstance();

// Funções utilitárias para uso direto
export const handleError = (error: Error | string, context?: Record<string, any>) => 
  errorHandler.handleError(error, context);

export const logInfo = (message: string, context?: Record<string, any>) => 
  errorHandler.logInfo(message, context);

export const logWarning = (message: string, context?: Record<string, any>) => 
  errorHandler.logWarning(message, context);

// Função para criar erros estruturados
export function createAppError(
  message: string,
  code: string = 'CUSTOM_ERROR',
  severity: AppError['severity'] = 'medium',
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.severity = severity;
  error.context = context;
  error.timestamp = new Date();
  error.isRecoverable = true;
  error.retryCount = 0;
  error.maxRetries = 3;
  
  return error;
}

// Função para tratamento de erros em async/await
export function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return asyncFn().catch(error => {
    handleError(error, context);
    throw error;
  });
}

// Função para retry automático
export async function withRetry<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: Record<string, any>
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        handleError(lastError, { ...context, attempt, maxRetries });
        throw lastError;
      }
      
      logWarning(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`, {
        error: lastError.message,
        attempt,
        maxRetries,
        ...context
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Backoff exponencial
    }
  }
  
  throw lastError!;
}

// Exportar tipos
export type { AppError, ErrorHandlerConfig };
export { ErrorHandler };
