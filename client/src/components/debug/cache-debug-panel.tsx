import { useState, useEffect } from 'react';
import { useCacheDebug } from '@/hooks/use-cache-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Refresh, 
  Trash2, 
  Database, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CacheDebugPanelProps {
  isVisible?: boolean;
  onToggle?: (visible: boolean) => void;
}

export function CacheDebugPanel({ isVisible = false, onToggle }: CacheDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { debugCache, clearAllCacheDebug } = useCacheDebug();

  const updateCacheInfo = () => {
    const info = debugCache();
    setCacheInfo(info);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    if (isVisible) {
      updateCacheInfo();
      const interval = setInterval(updateCacheInfo, 5000); // Atualizar a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-[#277677] shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#277677] flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cache Debug Panel
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle?.(false)}
                className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Resumo rápido */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {cacheInfo?.queries?.length || 0} Queries
              </Badge>
              <Badge variant="outline" className="text-xs">
                {cacheInfo?.mutations?.length || 0} Mutations
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              onClick={updateCacheInfo}
              className="flex-1 text-xs h-8"
            >
              <Refresh className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={clearAllCacheDebug}
              className="flex-1 text-xs h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>

          {/* Detalhes expandidos */}
          {isExpanded && cacheInfo && (
            <div className="space-y-3 border-t pt-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">
                Cache Details
              </div>
              
              {/* Queries */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600">Queries:</div>
                {cacheInfo.queries?.slice(0, 5).map((query: any, index: number) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">
                        {query.queryKey.join(' > ')}
                      </span>
                      <div className="flex items-center gap-1">
                        {query.state.isFetching && (
                          <Refresh className="h-3 w-3 animate-spin text-blue-500" />
                        )}
                        {query.state.error ? (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(query.state.dataUpdatedAt).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Database className="h-3 w-3" />
                        {query.isStale() ? 'Stale' : 'Fresh'}
                      </div>
                    </div>
                  </div>
                ))}
                {cacheInfo.queries?.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    ... and {cacheInfo.queries.length - 5} more
                  </div>
                )}
              </div>

              {/* Mutations */}
              {cacheInfo.mutations?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600">Mutations:</div>
                  {cacheInfo.mutations?.slice(0, 3).map((mutation: any, index: number) => (
                    <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {mutation.options.mutationKey?.join(' > ') || 'Unknown'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {mutation.state.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Estatísticas */}
              <div className="text-xs text-gray-500 border-t pt-2">
                <div>Last Update: {lastUpdate.toLocaleTimeString()}</div>
                <div>Total Size: ~{Math.round((cacheInfo.cacheSize || 0) / 1024)}KB</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para controlar visibilidade do painel
export function useCacheDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Atalho de teclado para mostrar/ocultar (Ctrl+Shift+D)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          setIsVisible(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return {
    isVisible,
    setIsVisible,
  };
}
