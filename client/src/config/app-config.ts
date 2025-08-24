// Configuração robusta da aplicação com fallbacks e validação
interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
  };
  features: {
    enableCache: boolean;
    enableOffline: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
  performance: {
    imageLazyLoading: boolean;
    componentLazyLoading: boolean;
    cacheStrategy: 'memory' | 'localStorage' | 'sessionStorage';
    maxCacheSize: number;
  };
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableXSSProtection: boolean;
    allowedOrigins: string[];
  };
  contact: {
    defaultWhatsApp: string;
    defaultPhone: string;
    defaultEmail: string;
    defaultAddress: string;
    defaultCNPJ: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };
}

// Configurações padrão robustas
const defaultConfig: AppConfig = {
  api: {
    baseUrl: window.location.origin,
    timeout: 10000,
    retries: 3,
    retryDelay: 1000
  },
  features: {
    enableCache: true,
    enableOffline: true,
    enableAnalytics: false,
    enableErrorReporting: true
  },
  performance: {
    imageLazyLoading: true,
    componentLazyLoading: true,
    cacheStrategy: 'localStorage',
    maxCacheSize: 50 * 1024 * 1024 // 50MB
  },
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    allowedOrigins: ['*']
  },
  contact: {
    defaultWhatsApp: '+55 (11) 91234-5678',
    defaultPhone: '+55 (11) 1234-5678',
    defaultEmail: 'contato@unipetplan.com.br',
    defaultAddress: 'AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI',
    defaultCNPJ: '00.000.000/0001-00'
  },
  theme: {
    primaryColor: '#1a5a5c',
    secondaryColor: '#277677',
    accentColor: '#E1AC33',
    darkMode: false
  }
};

// Função para obter configuração do ambiente
function getEnvironmentConfig(): Partial<AppConfig> {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return {
      api: {
        baseUrl: process.env.VITE_API_URL || window.location.origin,
        timeout: 15000,
        retries: 2,
        retryDelay: 2000
      },
      features: {
        enableCache: true,
        enableOffline: false,
        enableAnalytics: true,
        enableErrorReporting: true
      },
      performance: {
        imageLazyLoading: true,
        componentLazyLoading: true,
        cacheStrategy: 'localStorage',
        maxCacheSize: 100 * 1024 * 1024 // 100MB
      }
    };
  }
  
  return {
    api: {
      baseUrl: process.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 5000,
      retries: 1,
      retryDelay: 500
    },
    features: {
      enableCache: false,
      enableOffline: false,
      enableAnalytics: false,
      enableErrorReporting: true
    }
  };
}

// Função para obter configurações das variáveis de ambiente
function getEnvConfig(): Partial<AppConfig> {
  return {
    contact: {
      defaultWhatsApp: process.env.VITE_DEFAULT_WHATSAPP || defaultConfig.contact.defaultWhatsApp,
      defaultPhone: process.env.VITE_DEFAULT_PHONE || defaultConfig.contact.defaultPhone,
      defaultEmail: process.env.VITE_DEFAULT_EMAIL || defaultConfig.contact.defaultEmail,
      defaultAddress: process.env.VITE_DEFAULT_ADDRESS || defaultConfig.contact.defaultAddress,
      defaultCNPJ: process.env.VITE_DEFAULT_CNPJ || defaultConfig.contact.defaultCNPJ
    },
    theme: {
      primaryColor: process.env.VITE_PRIMARY_COLOR || defaultConfig.theme.primaryColor,
      secondaryColor: process.env.VITE_SECONDARY_COLOR || defaultConfig.theme.secondaryColor,
      accentColor: process.env.VITE_ACCENT_COLOR || defaultConfig.theme.accentColor,
      darkMode: process.env.VITE_DARK_MODE === 'true'
    }
  };
}

// Função para validar configuração
function validateConfig(config: AppConfig): AppConfig {
  // Validar URLs
  try {
    new URL(config.api.baseUrl);
  } catch {
    console.warn('⚠️ URL da API inválida, usando fallback');
    config.api.baseUrl = defaultConfig.api.baseUrl;
  }
  
  // Validar timeouts
  if (config.api.timeout < 1000) {
    console.warn('⚠️ Timeout muito baixo, usando valor padrão');
    config.api.timeout = defaultConfig.api.timeout;
  }
  
  if (config.api.timeout > 60000) {
    console.warn('⚠️ Timeout muito alto, usando valor padrão');
    config.api.timeout = defaultConfig.api.timeout;
  }
  
  // Validar cores
  const colorRegex = /^#[0-9A-F]{6}$/i;
  if (!colorRegex.test(config.theme.primaryColor)) {
    console.warn('⚠️ Cor primária inválida, usando valor padrão');
    config.theme.primaryColor = defaultConfig.theme.primaryColor;
  }
  
  if (!colorRegex.test(config.theme.secondaryColor)) {
    console.warn('⚠️ Cor secundária inválida, usando valor padrão');
    config.theme.secondaryColor = defaultConfig.theme.secondaryColor;
  }
  
  if (!colorRegex.test(config.theme.accentColor)) {
    console.warn('⚠️ Cor de destaque inválida, usando valor padrão');
    config.theme.accentColor = defaultConfig.theme.accentColor;
  }
  
  return config;
}

// Configuração final mesclada e validada
const appConfig: AppConfig = validateConfig({
  ...defaultConfig,
  ...getEnvironmentConfig(),
  ...getEnvConfig()
});

// Função para obter configuração
export function getConfig(): AppConfig {
  return { ...appConfig };
}

// Função para obter configuração específica
export function getConfigValue<K extends keyof AppConfig>(
  key: K
): AppConfig[K] {
  return appConfig[key];
}

// Função para obter configuração aninhada
export function getNestedConfigValue<K extends keyof AppConfig, S extends keyof AppConfig[K]>(
  section: K,
  key: S
): AppConfig[K][S] {
  return appConfig[section][key];
}

// Função para verificar se uma funcionalidade está habilitada
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return appConfig.features[feature];
}

// Função para obter configuração da API
export function getApiConfig() {
  return appConfig.api;
}

// Função para obter configuração de contato
export function getContactConfig() {
  return appConfig.contact;
}

// Função para obter configuração de tema
export function getThemeConfig() {
  return appConfig.theme;
}

// Função para obter configuração de performance
export function getPerformanceConfig() {
  return appConfig.performance;
}

// Função para obter configuração de segurança
export function getSecurityConfig() {
  return appConfig.security;
}

// Função para obter configuração com fallback
export function getConfigWithFallback<K extends keyof AppConfig>(
  key: K,
  fallback: AppConfig[K]
): AppConfig[K] {
  try {
    const value = appConfig[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao obter configuração ${String(key)}, usando fallback`);
  }
  
  return fallback;
}

// Função para obter configuração aninhada com fallback
export function getNestedConfigWithFallback<K extends keyof AppConfig, S extends keyof AppConfig[K]>(
  section: K,
  key: S,
  fallback: AppConfig[K][S]
): AppConfig[K][S] {
  try {
    const value = appConfig[section][key];
    if (value !== undefined && value !== null) {
      return value;
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao obter configuração ${String(section)}.${String(key)}, usando fallback`);
  }
  
  return fallback;
}

// Função para verificar se estamos em produção
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Função para verificar se estamos em desenvolvimento
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Função para verificar se estamos em teste
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

// Função para obter informações de debug
export function getDebugInfo(): Record<string, any> {
  return {
    environment: process.env.NODE_ENV,
    apiUrl: appConfig.api.baseUrl,
    features: appConfig.features,
    performance: appConfig.performance,
    security: appConfig.security,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
}

// Função para validar se a configuração está completa
export function isConfigValid(): boolean {
  try {
    // Verificar se todas as configurações obrigatórias estão presentes
    const requiredFields = [
      'api.baseUrl',
      'contact.defaultEmail',
      'theme.primaryColor'
    ];
    
    for (const field of requiredFields) {
      const [section, key] = field.split('.') as [keyof AppConfig, string];
      const value = appConfig[section][key as keyof AppConfig[typeof section]];
      
      if (value === undefined || value === null || value === '') {
        console.error(`❌ Configuração obrigatória ausente: ${field}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao validar configuração:', error);
    return false;
  }
}

// Função para inicializar configuração
export function initializeConfig(): void {
  console.log('⚙️ Inicializando configuração da aplicação...');
  
  if (isConfigValid()) {
    console.log('✅ Configuração válida e completa');
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: ${appConfig.api.baseUrl}`);
    console.log(`📧 Contato: ${appConfig.contact.defaultEmail}`);
    console.log(`🎨 Tema: ${appConfig.theme.primaryColor}`);
  } else {
    console.error('❌ Configuração inválida ou incompleta');
    console.warn('⚠️ Usando configurações padrão como fallback');
  }
}

// Exportar configuração padrão
export { defaultConfig };

// Exportar configuração da aplicação
export default appConfig;
