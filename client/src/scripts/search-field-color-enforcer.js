/**
 * SCRIPT PARA FORÇAR COR #2d2d2d NO CAMPO DE BUSCA DA REDE CREDENCIADA
 * Solução de última instância para garantir que a cor seja sempre aplicada
 */

(function() {
  'use strict';

  // Configurações
  const SEARCH_INPUT_SELECTOR = 'input[data-testid="input-search-units"]';
  const TARGET_COLOR = '#2d2d2d';
  const CHECK_INTERVAL = 100; // ms
  const MAX_RETRIES = 50;

  // Função para forçar a cor no campo de busca
  function forceSearchFieldColor(input) {
    if (!input) return;

    try {
      // Aplicar cor via style inline (máxima prioridade)
      input.style.setProperty('color', TARGET_COLOR, 'important');
      input.style.setProperty('-webkit-text-fill-color', TARGET_COLOR, 'important');
      input.style.setProperty('caret-color', TARGET_COLOR, 'important');
      
      // Aplicar cor via CSS custom properties
      input.style.setProperty('--search-input-color', TARGET_COLOR, 'important');
      
      // Forçar reflow para garantir aplicação
      input.offsetHeight;
      
      console.log('🔍 [SEARCH-COLOR] Cor #2d2d2d aplicada via JavaScript');
    } catch (error) {
      console.warn('🔍 [SEARCH-COLOR] Erro ao aplicar cor:', error);
    }
  }

  // Função para verificar se a cor está correta
  function isColorCorrect(input) {
    if (!input) return false;
    
    try {
      const computedStyle = window.getComputedStyle(input);
      const currentColor = computedStyle.color;
      const currentWebkitColor = computedStyle.webkitTextFillColor;
      
      // Verificar se a cor está correta (rgb(45, 45, 45) = #2d2d2d)
      return currentColor === 'rgb(45, 45, 45)' || 
             currentWebkitColor === 'rgb(45, 45, 45)' ||
             currentColor === TARGET_COLOR ||
             currentWebkitColor === TARGET_COLOR;
    } catch (error) {
      return false;
    }
  }

  // Função para encontrar e configurar o campo de busca
  function setupSearchField() {
    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    
    if (searchInput) {
      console.log('🔍 [SEARCH-COLOR] Campo de busca encontrado, configurando...');
      
      // Aplicar cor inicial
      forceSearchFieldColor(searchInput);
      
      // Adicionar classe CSS específica se não existir
      if (!searchInput.classList.contains('search-field-text-color-fix')) {
        searchInput.classList.add('search-field-text-color-fix');
      }
      
      // Configurar MutationObserver para monitorar mudanças
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            // Reaplicar cor se houver mudanças
            setTimeout(() => forceSearchFieldColor(searchInput), 0);
          }
        });
      });

      // Observar mudanças no elemento
      observer.observe(searchInput, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: false
      });

      // Event listeners para manter a cor durante interações
      const events = ['input', 'focus', 'blur', 'keyup', 'change', 'paste'];
      events.forEach(eventType => {
        searchInput.addEventListener(eventType, () => {
          setTimeout(() => forceSearchFieldColor(searchInput), 0);
        });
      });

      // Verificação contínua da cor
      const colorCheckInterval = setInterval(() => {
        if (!isColorCorrect(searchInput)) {
          console.log('🔍 [SEARCH-COLOR] Cor incorreta detectada, reaplicando...');
          forceSearchFieldColor(searchInput);
        }
      }, CHECK_INTERVAL);

      // Cleanup function
      return () => {
        observer.disconnect();
        clearInterval(colorCheckInterval);
        events.forEach(eventType => {
          searchInput.removeEventListener(eventType, () => {});
        });
      };
    }
    
    return null;
  }

  // Função principal para inicializar
  function init() {
    console.log('🔍 [SEARCH-COLOR] Inicializando enforçador de cor...');
    
    let retryCount = 0;
    let cleanup = null;
    
    // Tentar configurar o campo de busca
    function attemptSetup() {
      cleanup = setupSearchField();
      
      if (cleanup) {
        console.log('🔍 [SEARCH-COLOR] Campo de busca configurado com sucesso!');
        return;
      }
      
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        console.log(`🔍 [SEARCH-COLOR] Tentativa ${retryCount}/${MAX_RETRIES} - Campo não encontrado, tentando novamente...`);
        setTimeout(attemptSetup, 200);
      } else {
        console.warn('🔍 [SEARCH-COLOR] Máximo de tentativas atingido. Campo de busca não encontrado.');
      }
    }
    
    // Iniciar tentativas
    attemptSetup();
    
    // Limpar quando a página for descarregada
    window.addEventListener('beforeunload', () => {
      if (cleanup) cleanup();
    });
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Também executar quando a página estiver completamente carregada
  window.addEventListener('load', init);
  
  // Executar quando a rota mudar (para SPAs)
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(init, 100);
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(init, 100);
    };
  }

  // Exportar para uso global se necessário
  window.SearchFieldColorEnforcer = {
    forceColor: forceSearchFieldColor,
    setupField: setupSearchField,
    init: init
  };

})();
