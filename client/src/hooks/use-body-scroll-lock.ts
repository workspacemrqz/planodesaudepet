import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para prevenir o deslocamento da página ao abrir modais/popups.
 * Preserva overflow-x: hidden do CSS global e controla apenas overflow-y.
 * Calcula a largura da scrollbar e aplica padding-right equivalente ao body.
 */
export function useBodyScrollLock(isLocked: boolean) {
  const originalStyleRef = useRef<{
    overflowY: string;
    overflowX: string;
    paddingRight: string;
    width: string;
  } | null>(null);

  useEffect(() => {
    if (!isLocked) {
      // Se não está bloqueado, restaurar estilos originais se existirem
      if (originalStyleRef.current) {
        document.body.style.overflowY = originalStyleRef.current.overflowY;
        document.body.style.overflowX = originalStyleRef.current.overflowX;
        document.body.style.paddingRight = originalStyleRef.current.paddingRight;
        document.body.style.width = originalStyleRef.current.width;
        originalStyleRef.current = null;
      }
      return;
    }

    // Salvar estilos originais apenas uma vez
    if (!originalStyleRef.current) {
      originalStyleRef.current = {
        overflowY: document.body.style.overflowY || '',
        overflowX: document.body.style.overflowX || '',
        paddingRight: document.body.style.paddingRight || '',
        width: document.body.style.width || '',
      };
    }

    // Abordagem mais simples: apenas aplicar overflow hidden sem compensação de scrollbar
    // Isso evita qualquer deslocamento horizontal causado por padding/margin
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'hidden';
    
    // Não aplicar padding ou margin para evitar deslocamento horizontal
    // O usuário pode aceitar o pequeno "jump" da scrollbar desaparecendo
    // ao invés do deslocamento horizontal mais problemático

    // Cleanup function para restaurar estilos quando o componente desmonta
    return () => {
      if (originalStyleRef.current) {
        document.body.style.overflowY = originalStyleRef.current.overflowY;
        document.body.style.overflowX = originalStyleRef.current.overflowX;
        document.body.style.paddingRight = originalStyleRef.current.paddingRight;
        document.body.style.width = originalStyleRef.current.width;
        originalStyleRef.current = null;
      }
    };
  }, [isLocked]);

  // Cleanup adicional no unmount do componente
  useEffect(() => {
    return () => {
      if (originalStyleRef.current) {
        document.body.style.overflowY = originalStyleRef.current.overflowY;
        document.body.style.overflowX = originalStyleRef.current.overflowX;
        document.body.style.paddingRight = originalStyleRef.current.paddingRight;
        document.body.style.width = originalStyleRef.current.width;
        originalStyleRef.current = null;
      }
    };
  }, []);
}