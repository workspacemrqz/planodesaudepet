import { randomUUID } from 'crypto';

// Interface para itens do cache
interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  tags: string[];
  version: string;
}

// Interface para configurações do cache
interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableCompression: boolean;
  enablePersistence: boolean;
  enableMetrics: boolean;
  maxMemoryUsage: number;
}

// Interface para métricas do cache
interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  memoryUsage: number;
  hitRate: number;
  averageAccessTime: number;
}

// Classe principal do gerenciador de cache
class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private version: string = randomUUID();

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 300000, // 5 minutos
      cleanupInterval: 60000, // 1 minuto
      enableCompression: false,
      enablePersistence: false,
      enableMetrics: true,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      memoryUsage: 0,
      hitRate: 0,
      averageAccessTime: 0
    };

    this.initializeCache();
  }

  public static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  private initializeCache(): void {
    // Iniciar limpeza automática
    this.startCleanupInterval();
    
    // Configurar listeners para monitoramento de memória
    if (this.config.enableMetrics) {
      this.monitorMemoryUsage();
    }

    console.log('🗄️ Cache Manager inicializado com sucesso');
    console.log(`   Tamanho máximo: ${this.config.maxSize} itens`);
    console.log(`   TTL padrão: ${this.config.defaultTTL / 1000}s`);
    console.log(`   Limpeza a cada: ${this.config.cleanupInterval / 1000}s`);
  }

  /**
   * Obter um item do cache
   */
  public get<T>(key: string): T | null {
    const startTime = Date.now();
    const item = this.cache.get(key);

    if (!item) {
      this.recordMiss();
      return null;
    }

    // Verificar se o item expirou
    if (this.isExpired(item)) {
      this.delete(key);
      this.recordMiss();
      return null;
    }

    // Atualizar estatísticas de acesso
    item.accessCount++;
    item.lastAccess = Date.now();

    // Mover para o final (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);

    this.recordHit(Date.now() - startTime);
    return item.value;
  }

  /**
   * Definir um item no cache
   */
  public set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    tags: string[] = []
  ): void {
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccess: Date.now(),
      tags,
      version: this.version
    };

    // Verificar se há espaço disponível
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    // Verificar uso de memória
    if (this.metrics.memoryUsage > this.config.maxMemoryUsage) {
      this.evictByMemory();
    }

    this.cache.set(key, item);
    this.recordSet();
  }

  /**
   * Definir múltiplos itens no cache
   */
  public setMultiple<T>(items: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>): void {
    items.forEach(({ key, value, ttl, tags }) => {
      this.set(key, value, ttl, tags);
    });
  }

  /**
   * Obter múltiplos itens do cache
   */
  public getMultiple<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    
    keys.forEach(key => {
      result.set(key, this.get<T>(key));
    });

    return result;
  }

  /**
   * Verificar se uma chave existe no cache
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Deletar um item do cache
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.recordDelete();
    }
    return deleted;
  }

  /**
   * Deletar múltiplos itens por chaves
   */
  public deleteMultiple(keys: string[]): number {
    let deletedCount = 0;
    
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Deletar itens por tags
   */
  public deleteByTags(tags: string[]): number {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (tags.some(tag => item.tags.includes(tag))) {
        keysToDelete.push(key);
      }
    });

    return this.deleteMultiple(keysToDelete);
  }

  /**
   * Limpar todo o cache
   */
  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.metrics.evictions += size;
    console.log(`🗑️ Cache limpo - ${size} itens removidos`);
  }

  /**
   * Obter estatísticas do cache
   */
  public getStats(): CacheMetrics {
    // Calcular hit rate
    const totalRequests = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;

    // Calcular uso de memória atual
    this.metrics.memoryUsage = this.calculateMemoryUsage();

    return { ...this.metrics };
  }

  /**
   * Obter chaves por tags
   */
  public getKeysByTags(tags: string[]): string[] {
    const keys: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (tags.some(tag => item.tags.includes(tag))) {
        keys.push(key);
      }
    });

    return keys;
  }

  /**
   * Obter tamanho atual do cache
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Obter chaves do cache
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Obter valores do cache
   */
  public values<T>(): T[] {
    return Array.from(this.cache.values()).map(item => item.value);
  }

  /**
   * Obter entradas do cache
   */
  public entries<T>(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }

  /**
   * Verificar se o cache está vazio
   */
  public isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Obter item mais antigo
   */
  public getOldest(): CacheItem | null {
    if (this.cache.size === 0) return null;
    
    let oldest: CacheItem | null = null;
    let oldestTime = Date.now();
    
    this.cache.forEach(item => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldest = item;
      }
    });

    return oldest;
  }

  /**
   * Obter item mais acessado
   */
  public getMostAccessed(): CacheItem | null {
    if (this.cache.size === 0) return null;
    
    let mostAccessed: CacheItem | null = null;
    let maxAccess = 0;
    
    this.cache.forEach(item => {
      if (item.accessCount > maxAccess) {
        maxAccess = item.accessCount;
        mostAccessed = item;
      }
    });

    return mostAccessed;
  }

  /**
   * Verificar se um item expirou
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.timestamp + item.ttl;
  }

  /**
   * Evictar item menos recentemente usado (LRU)
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    this.cache.forEach((item, key) => {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Evictar itens por uso de memória
   */
  private evictByMemory(): void {
    const items = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    let deletedCount = 0;
    const targetMemory = this.config.maxMemoryUsage * 0.8; // Reduzir para 80%

    for (const [key, item] of items) {
      if (this.metrics.memoryUsage <= targetMemory) break;
      
      this.delete(key);
      deletedCount++;
    }

    if (deletedCount > 0) {
      console.log(`🗑️ Evictados ${deletedCount} itens por uso de memória`);
    }
  }

  /**
   * Calcular uso de memória atual
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0;
    
    this.cache.forEach(item => {
      totalSize += this.estimateItemSize(item);
    });

    return totalSize;
  }

  /**
   * Estimar tamanho de um item
   */
  private estimateItemSize(item: CacheItem): number {
    let size = 0;
    
    // Tamanho da chave
    size += item.key.length * 2; // UTF-16
    
    // Tamanho do valor (estimativa)
    if (typeof item.value === 'string') {
      size += item.value.length * 2;
    } else if (typeof item.value === 'number') {
      size += 8;
    } else if (typeof item.value === 'boolean') {
      size += 1;
    } else if (Array.isArray(item.value)) {
      size += item.value.length * 8; // Estimativa
    } else if (typeof item.value === 'object') {
      size += JSON.stringify(item.value).length * 2;
    }
    
    // Tamanho dos metadados
    size += 100; // Estimativa para timestamps, contadores, etc.
    
    return size;
  }

  /**
   * Iniciar intervalo de limpeza
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Limpeza automática do cache
   */
  private cleanup(): void {
    const startSize = this.cache.size;
    const now = Date.now();
    
    // Remover itens expirados
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }

    const endSize = this.cache.size;
    const removed = startSize - endSize;
    
    if (removed > 0) {
      console.log(`🧹 Limpeza automática: ${removed} itens expirados removidos`);
    }

    // Atualizar métricas
    this.metrics.memoryUsage = this.calculateMemoryUsage();
  }

  /**
   * Monitorar uso de memória
   */
  private monitorMemoryUsage(): void {
    setInterval(() => {
      const usage = this.calculateMemoryUsage();
      const usageMB = (usage / 1024 / 1024).toFixed(2);
      
      if (usage > this.config.maxMemoryUsage * 0.9) {
        console.warn(`⚠️ Uso de memória alto: ${usageMB}MB`);
      }
    }, 30000); // A cada 30 segundos
  }

  /**
   * Registrar hit no cache
   */
  private recordHit(accessTime: number): void {
    this.metrics.hits++;
    this.metrics.averageAccessTime = 
      (this.metrics.averageAccessTime * (this.metrics.hits - 1) + accessTime) / this.metrics.hits;
  }

  /**
   * Registrar miss no cache
   */
  private recordMiss(): void {
    this.metrics.misses++;
  }

  /**
   * Registrar set no cache
   */
  private recordSet(): void {
    this.metrics.sets++;
  }

  /**
   * Registrar delete no cache
   */
  private recordDelete(): void {
    this.metrics.deletes++;
  }

  /**
   * Parar o cache manager
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.cache.clear();
    console.log('🛑 Cache Manager parado');
  }

  /**
   * Reiniciar o cache
   */
  public restart(): void {
    this.stop();
    this.initializeCache();
  }
}

// Instância global do cache manager
export const cacheManager = CacheManager.getInstance();

// Funções utilitárias para uso direto
export const cache = {
  get: <T>(key: string): T | null => cacheManager.get<T>(key),
  set: <T>(key: string, value: T, ttl?: number, tags?: string[]): void => 
    cacheManager.set(key, value, ttl, tags),
  has: (key: string): boolean => cacheManager.has(key),
  delete: (key: string): boolean => cacheManager.delete(key),
  clear: (): void => cacheManager.clear(),
  stats: (): CacheMetrics => cacheManager.getStats(),
  size: (): number => cacheManager.size()
};

// Função para criar chaves de cache consistentes
export function createCacheKey(prefix: string, ...parts: (string | number | boolean)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

// Função para cache com fallback
export async function cacheWithFallback<T>(
  key: string,
  fallback: () => Promise<T>,
  ttl?: number,
  tags?: string[]
): Promise<T> {
  // Tentar obter do cache primeiro
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Se não estiver no cache, executar fallback
  try {
    const value = await fallback();
    cache.set(key, value, ttl, tags);
    return value;
  } catch (error) {
    console.error(`❌ Erro no fallback para chave ${key}:`, error);
    throw error;
  }
}

// Função para cache com invalidação por tags
export function invalidateCacheByTags(tags: string[]): number {
  return cacheManager.deleteByTags(tags);
}

// Função para cache com TTL baseado em horário
export function setCacheWithTimeBasedTTL<T>(
  key: string,
  value: T,
  hour: number,
  minute: number = 0,
  tags?: string[]
): void {
  const now = new Date();
  const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  
  // Se o horário já passou hoje, definir para amanhã
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const ttl = targetTime.getTime() - now.getTime();
  cache.set(key, value, ttl, tags);
}

// Exportar tipos
export type { CacheItem, CacheConfig, CacheMetrics };
export { CacheManager };
