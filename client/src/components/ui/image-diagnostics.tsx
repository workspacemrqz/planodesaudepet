import React, { useState, useEffect } from 'react';

interface ImageDiagnosticData {
  url: string;
  status: 'loading' | 'success' | 'error' | 'timeout';
  loadTime?: number;
  errorMessage?: string;
  timestamp: Date;
}

interface ImageDiagnosticsProps {
  onDiagnosticUpdate?: (data: ImageDiagnosticData[]) => void;
  showConsole?: boolean;
}

export const ImageDiagnostics: React.FC<ImageDiagnosticsProps> = ({
  onDiagnosticUpdate,
  showConsole = true
}) => {
  const [diagnostics, setDiagnostics] = useState<ImageDiagnosticData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Monitor all images on the page
  useEffect(() => {
    if (!isMonitoring) return;

    const images = document.querySelectorAll('img');
    const imageUrls = Array.from(images).map(img => img.src);

    imageUrls.forEach(url => {
      if (!url || url.startsWith('data:')) return;

      const startTime = Date.now();
      const diagnostic: ImageDiagnosticData = {
        url,
        status: 'loading',
        timestamp: new Date()
      };

      setDiagnostics(prev => [...prev, diagnostic]);

      // Test image loading
      const img = new Image();
      const timeout = setTimeout(() => {
        diagnostic.status = 'timeout';
        diagnostic.errorMessage = 'Timeout after 10 seconds';
        updateDiagnostic(diagnostic);
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        diagnostic.status = 'success';
        diagnostic.loadTime = Date.now() - startTime;
        updateDiagnostic(diagnostic);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        diagnostic.status = 'error';
        diagnostic.errorMessage = 'Failed to load image';
        updateDiagnostic(diagnostic);
      };

      img.src = url;
    });
  }, [isMonitoring]);

  const updateDiagnostic = (diagnostic: ImageDiagnosticData) => {
    setDiagnostics(prev => 
      prev.map(d => d.url === diagnostic.url ? diagnostic : d)
    );
    onDiagnosticUpdate?.(diagnostics);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setDiagnostics([]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const clearDiagnostics = () => {
    setDiagnostics([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'timeout': return 'text-yellow-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'timeout': return '⏰';
      case 'loading': return '⏳';
      default: return '❓';
    }
  };

  // Log to console if enabled
  useEffect(() => {
    if (showConsole && diagnostics.length > 0) {
      const errors = diagnostics.filter(d => d.status === 'error' || d.status === 'timeout');
      if (errors.length > 0) {
        console.group('🚨 Image Loading Issues Detected');
        errors.forEach(error => {
          console.error(`Failed to load: ${error.url}`, error.errorMessage);
        });
        console.groupEnd();
      }
    }
  }, [diagnostics, showConsole]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Image Diagnostics</h3>
        <div className="flex gap-2">
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Stop
            </button>
          )}
          <button
            onClick={clearDiagnostics}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {diagnostics.length === 0 ? (
          <p className="text-xs text-gray-500">No diagnostics yet</p>
        ) : (
          <div className="space-y-2">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="text-xs border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(diagnostic.status)}</span>
                  <span className={getStatusColor(diagnostic.status)}>
                    {diagnostic.status.toUpperCase()}
                  </span>
                  {diagnostic.loadTime && (
                    <span className="text-gray-500">
                      ({diagnostic.loadTime}ms)
                    </span>
                  )}
                </div>
                <div className="text-gray-600 truncate" title={diagnostic.url}>
                  {diagnostic.url}
                </div>
                {diagnostic.errorMessage && (
                  <div className="text-red-500 text-xs">
                    {diagnostic.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {diagnostics.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Total: {diagnostics.length}</span>
            <span>Errors: {diagnostics.filter(d => d.status === 'error').length}</span>
            <span>Timeouts: {diagnostics.filter(d => d.status === 'timeout').length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDiagnostics;
