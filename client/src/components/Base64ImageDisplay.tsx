import React, { useState, useEffect, useCallback } from 'react';

interface Base64ImageDisplayProps {
  base64Data: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const Base64ImageDisplay: React.FC<Base64ImageDisplayProps> = ({
  base64Data,
  alt,
  className = '',
  fallbackSrc = '/placeholder-image.svg',
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado para armazenar mensagens de erro

  // Simulação de type e id para o useCallback, pois não estão disponíveis diretamente no escopo desta função.
  // Em um cenário real, esses valores precisariam ser passados como props ou obtidos de outra forma.
  const type = 'default';
  const id = 'default';

  const handleError = useCallback((errorMessage?: string) => {
    console.error(`Erro ao carregar imagem ${type}:${id}`, errorMessage);
    setError(errorMessage || 'Falha ao carregar imagem');
    setIsLoading(false);
    setHasError(true); // Marcar que houve um erro
    if (onError) {
      onError();
    }
  }, [type, id, onError]); // Adicionado onError às dependências

  useEffect(() => {
    setIsLoading(true); // Reiniciar o estado de loading a cada mudança de base64Data
    setError(null); // Limpar erros anteriores
    setHasError(false); // Resetar o flag de erro

    if (base64Data && base64Data.startsWith('data:image/')) {
      setImageSrc(base64Data);
      setIsLoading(false);
      if (onLoad) {
        onLoad();
      }
    } else if (base64Data) {
      // Tentar adicionar prefix Base64 se estiver faltando, assumindo jpeg como padrão
      const base64Image = `data:image/jpeg;base64,${base64Data}`;
      // Uma verificação mais robusta para a validade do base64 seria ideal aqui
      setImageSrc(base64Image);
      setIsLoading(false);
      if (onLoad) {
        onLoad();
      }
    } else {
      // Sem dados, usar fallback
      setImageSrc(fallbackSrc);
      setIsLoading(false);
    }
  }, [base64Data, fallbackSrc, onLoad, onError]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setError(null);
    if (onLoad) {
      onLoad();
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded flex items-center justify-center`}>
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 rounded flex items-center justify-center`}>
        <div className="text-gray-400 text-sm text-center">
          <div>{error || 'Erro ao carregar imagem'}</div>
          <div className="text-xs">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default Base64ImageDisplay;