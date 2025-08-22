import { randomBytes } from 'crypto';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
config();

/**
 * Sistema de configuração automática que detecta o ambiente
 * e configura todas as variáveis necessárias automaticamente
 */
class AutoConfig {
  private static instance: AutoConfig;
  private config: Record<string, any> = {};

  private constructor() {
    this.initializeConfig();
  }

  public static getInstance(): AutoConfig {
    if (!AutoConfig.instance) {
      AutoConfig.instance = new AutoConfig();
    }
    return AutoConfig.instance;
  }

  /**
   * Inicializa todas as configurações automaticamente
   */
  private initializeConfig(): void {
    // 1. Detectar ambiente automaticamente
    this.config.NODE_ENV = this.detectEnvironment();
    
    // 2. Configurar porta e host automaticamente
    this.config.PORT = this.getPort();
    this.config.HOST = this.getHost();
    
    // 3. Gerar chave secreta automaticamente se não fornecida
    this.config.SESSION_SECRET = this.getSessionSecret();
    
    // 4. Configurar armazenamento automaticamente
    this.config.STORAGE_TYPE = this.detectStorageType();
    
    // 5. Configurar valores padrão de contato automaticamente
    this.setupDefaultContactInfo();
    
    // 6. Configurar variáveis do cliente automaticamente
    this.setupClientVariables();
    
    // 7. Validar configurações obrigatórias
    this.validateRequiredConfig();
    
    // 8. Aplicar configurações ao process.env
    this.applyConfig();
    
    // 9. Log das configurações aplicadas
    this.logConfiguration();
  }

  /**
   * Detecta automaticamente o ambiente de execução
   */
  private detectEnvironment(): string {
    // Se NODE_ENV já estiver definido, usa ele
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }
    
    // Detecta automaticamente baseado em variáveis de ambiente
    if (process.env.PORT === '8080' || process.env.HEROKU_APP_ID || process.env.RAILWAY_ENVIRONMENT) {
      return 'production';
    }
    
    // Se estiver rodando em um processo do PM2 ou similar
    if (process.env.PM2_HOME || process.env.PM2_INTERNAL_IP) {
      return 'production';
    }
    
    // Padrão para desenvolvimento
    return 'development';
  }

  /**
   * Configura a porta automaticamente baseada no ambiente
   */
  private getPort(): string {
    if (process.env.PORT) {
      return process.env.PORT;
    }
    
    return this.config.NODE_ENV === 'production' ? '8080' : '3000';
  }

  /**
   * Configura o host automaticamente
   */
  private getHost(): string {
    if (process.env.HOST) {
      return process.env.HOST;
    }
    
    return '0.0.0.0';
  }

  /**
   * Gera uma chave secreta segura automaticamente se não fornecida
   */
  private getSessionSecret(): string {
    if (process.env.SESSION_SECRET) {
      return process.env.SESSION_SECRET;
    }
    
    // Gera uma chave secreta aleatória de 64 bytes
    const secret = randomBytes(64).toString('hex');
    console.log('🔑 Chave secreta de sessão gerada automaticamente');
    return secret;
  }

  /**
   * Detecta o tipo de armazenamento disponível
   */
  private detectStorageType(): string {
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.PRIVATE_OBJECT_DIR) {
      return 'google-cloud';
    }
    
    if (process.env.REPLIT_SIDECAR_ENDPOINT) {
      return 'replit';
    }
    
    return 'local';
  }

  /**
   * Configura informações de contato padrão automaticamente
   */
  private setupDefaultContactInfo(): void {
    const defaults = {
      DEFAULT_WHATSAPP: '+55 (11) 91234-5678',
      DEFAULT_PHONE: '+55 (11) 1234-5678',
      DEFAULT_EMAIL: 'contato@unipetplan.com.br',
      DEFAULT_CNPJ: '00.000.000/0001-00',
      DEFAULT_ADDRESS: 'AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI'
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (!process.env[key]) {
        this.config[key] = value;
        console.log(`📞 Configuração padrão aplicada: ${key} = ${value}`);
      }
    });
  }

  /**
   * Configura variáveis do cliente automaticamente
   */
  private setupClientVariables(): void {
      const clientDefaults = {
    'VITE_DEFAULT_WHATSAPP': this.config.DEFAULT_WHATSAPP || process.env.DEFAULT_WHATSAPP || '+55 (11) 91234-5678',
    'VITE_DEFAULT_EMAIL': this.config.DEFAULT_EMAIL || process.env.DEFAULT_EMAIL || 'contato@unipetplan.com.br',
    'VITE_DEFAULT_PHONE': this.config.DEFAULT_PHONE || process.env.DEFAULT_EMAIL || '+55 (11) 1234-5678',
    'VITE_DEFAULT_ADDRESS': this.config.DEFAULT_ADDRESS || process.env.DEFAULT_ADDRESS || 'AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI',
    'VITE_DEFAULT_CNPJ': this.config.DEFAULT_CNPJ || process.env.DEFAULT_CNPJ || '00.000.000/0001-00'
  };

    Object.entries(clientDefaults).forEach(([key, value]) => {
      if (!process.env[key]) {
        this.config[key] = value;
        console.log(`🌐 Variável do cliente configurada: ${key} = ${value}`);
      }
    });
  }

  /**
   * Valida se as configurações obrigatórias estão presentes
   */
  private validateRequiredConfig(): void {
    const required = ['DATABASE_URL', 'LOGIN', 'SENHA'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.error('❌ CONFIGURAÇÕES OBRIGATÓRIAS FALTANDO:');
      missing.forEach(key => {
        console.error(`   - ${key}`);
      });
      console.error('\n📝 Crie um arquivo .env com as seguintes variáveis:');
      console.error('   DATABASE_URL=postgresql://username:password@localhost:5432/database_name');
      console.error('   LOGIN=seu-email@exemplo.com');
      console.error('   SENHA=sua-senha-segura');
      console.error('\n💡 Copie o arquivo env.example para .env e configure apenas essas variáveis!');
      throw new Error(`Configurações obrigatórias faltando: ${missing.join(', ')}`);
    }

    console.log('✅ Todas as configurações obrigatórias estão presentes');
  }

  /**
   * Aplica todas as configurações ao process.env
   */
  private applyConfig(): void {
    Object.entries(this.config).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }

  /**
   * Exibe um resumo das configurações aplicadas
   */
  private logConfiguration(): void {
    console.log('\n🚀 CONFIGURAÇÃO AUTOMÁTICA APLICADA:');
    console.log('=====================================');
    console.log(`🌍 Ambiente: ${this.config.NODE_ENV}`);
    console.log(`🔌 Porta: ${this.config.PORT}`);
    console.log(`🏠 Host: ${this.config.HOST}`);
    console.log(`💾 Armazenamento: ${this.config.STORAGE_TYPE}`);
    console.log(`🔑 Sessão: ${this.config.SESSION_SECRET ? 'Configurada' : 'Usando existente'}`);
    console.log(`📞 Contato: ${this.config.DEFAULT_WHATSAPP ? 'Padrão aplicado' : 'Usando existente'}`);
    console.log('=====================================\n');
  }

  /**
   * Obtém uma configuração específica
   */
  public get(key: string): any {
    return process.env[key] || this.config[key];
  }

  /**
   * Obtém todas as configurações
   */
  public getAll(): Record<string, any> {
    return { ...process.env, ...this.config };
  }

  /**
   * Verifica se uma configuração existe
   */
  public has(key: string): boolean {
    return !!(process.env[key] || this.config[key]);
  }
}

// Exporta a instância única
export const autoConfig = AutoConfig.getInstance();

// Exporta funções utilitárias
export const getConfig = (key: string) => autoConfig.get(key);
export const hasConfig = (key: string) => autoConfig.has(key);
export const getAllConfig = () => autoConfig.getAll();
