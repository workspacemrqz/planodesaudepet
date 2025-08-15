import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para prevenir o deslocamento da página ao abrir modais/popups.
 * Preserva overflow-x: hidden do CSS global e controla apenas overflow-y.
 * Calcula a largura da scrollbar e aplica padding-right equivalente ao body.
 */
export function useBodyScrollLock(isLocked: boolean) {
  const originalStyleRef = useRef<{
    overflowY: string;
    paddingRight: string;
  } | null>(null);

  useEffect(() => {
    if (!isLocked) {
      // Restaurar estilos originais quando não está mais bloqueado
      if (originalStyleRef.current) {
        document.body.style.overflowY = originalStyleRef.current.overflowY;
        document.body.style.paddingRight = originalStyleRef.current.paddingRight;
        originalStyleRef.current = null;
      }
      return;
    }

    // Salvar estilos originais antes de modificar
    if (!originalStyleRef.current) {
      originalStyleRef.current = {
        overflowY: document.body.style.overflowY || '',
        paddingRight: document.body.style.paddingRight || '',
      };
    }

    // Verificar se há scrollbar vertical antes de calcular
    const hasVerticalScrollbar = document.documentElement.scrollHeight > window.innerHeight;
    
    if (hasVerticalScrollbar) {
      // Calcular largura da scrollbar apenas se ela existir
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Aplicar overflow-y hidden e padding-right para compensar a scrollbar
      // Preserva overflow-x: hidden do CSS global
      document.body.style.overflowY = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Se não há scrollbar, apenas aplicar overflow-y hidden sem padding
      document.body.style.overflowY = 'hidden';
    }

    // Cleanup function para restaurar estilos quando o componente desmonta
    return () => {
      if (originalStyleRef.current) {
        document.body.style.overflowY = originalStyleRef.current.overflowY;
        document.body.style.paddingRight = originalStyleRef.current.paddingRight;
        originalStyleRef.current = null;
      }
    };
  }, [isLocked]);

  // Cleanup adicional no unmount do componente
  useEffect(() => {
    return () => {
      if (originalStyleRef.current) {
        document.body.style.overflowY = originalStyleRef.current.overflowY;
        document.body.style.paddingRight = originalStyleRef.current.paddingRight;
        originalStyleRef.current = null;
      }
    };
  }, []);
}