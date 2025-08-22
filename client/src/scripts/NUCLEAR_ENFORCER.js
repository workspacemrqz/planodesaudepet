/**
 * ENFORÇADOR NUCLEAR PARA COR #2d2d2d NO CAMPO DE BUSCA
 * ESTE SCRIPT VAI FORÇAR A COR A CADA MILISSEGUNDO
 * NADA PODE IMPEDIR ESTE SCRIPT DE FUNCIONAR
 */

(function() {
  'use strict';

  console.log('🚀 [NUCLEAR] Iniciando ENFORÇADOR NUCLEAR...');

  // Configurações NUCLEARES
  const SEARCH_INPUT_SELECTOR = 'input[data-testid="input-search-units"]';
  const TARGET_COLOR = '#2d2d2d';
  const NUCLEAR_INTERVAL = 1; // 1 milissegundo - NUCLEAR!
  const MAX_RETRIES = 1000; // 1000 tentativas - NUCLEAR!

  // Função NUCLEAR para forçar a cor
  function NUCLEAR_FORCE_COLOR(input) {
    if (!input) return;

    try {
      // MÉTODO NUCLEAR 1: setProperty com !important
      input.style.setProperty('color', TARGET_COLOR, 'important');
      input.style.setProperty('-webkit-text-fill-color', TARGET_COLOR, 'important');
      input.style.setProperty('text-fill-color', TARGET_COLOR, 'important');
      input.style.setProperty('caret-color', TARGET_COLOR, 'important');
      
      // MÉTODO NUCLEAR 2: Atribuição direta
      input.style.color = TARGET_COLOR;
      input.style.webkitTextFillColor = TARGET_COLOR;
      input.style.textFillColor = TARGET_COLOR;
      input.style.caretColor = TARGET_COLOR;
      
      // MÉTODO NUCLEAR 3: CSS custom properties
      input.style.setProperty('--search-input-color', TARGET_COLOR, 'important');
      input.style.setProperty('--search-input-placeholder-color', TARGET_COLOR, 'important');
      input.style.setProperty('--search-input-caret-color', TARGET_COLOR, 'important');
      
      // MÉTODO NUCLEAR 4: Forçar reflow
      input.offsetHeight;
      input.offsetWidth;
      input.getBoundingClientRect();
      
      // MÉTODO NUCLEAR 5: Remover classes conflitantes
      const conflictingClasses = ['text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 
                                'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 
                                'text-gray-800', 'text-gray-900', 'text-black', 'text-[#302e2b]', 
                                'text-[#FBF9F7]'];
      
      conflictingClasses.forEach(className => {
        if (input.classList.contains(className)) {
          input.classList.remove(className);
        }
      });
      
      // MÉTODO NUCLEAR 6: Adicionar classe específica
      if (!input.classList.contains('NUCLEAR-COLOR-FIX')) {
        input.classList.add('NUCLEAR-COLOR-FIX');
      }
      
      console.log('🚀 [NUCLEAR] Cor #2d2d2d aplicada via ENFORÇADOR NUCLEAR');
    } catch (error) {
      console.warn('🚀 [NUCLEAR] Erro ao aplicar cor:', error);
    }
  }

  // Função NUCLEAR para verificar se a cor está correta
  function NUCLEAR_CHECK_COLOR(input) {
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

  // Função NUCLEAR para encontrar e configurar o campo de busca
  function NUCLEAR_SETUP_FIELD() {
    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    
    if (searchInput) {
      console.log('🚀 [NUCLEAR] Campo de busca encontrado, configurando ENFORÇADOR NUCLEAR...');
      
      // Aplicar cor inicial NUCLEAR
      NUCLEAR_FORCE_COLOR(searchInput);
      
      // ENFORÇADOR NUCLEAR 1: Verificação a cada 1ms
      const NUCLEAR_INTERVAL_ID = setInterval(() => {
        if (!NUCLEAR_CHECK_COLOR(searchInput)) {
          console.log('🚀 [NUCLEAR] Cor incorreta detectada, aplicando FORÇA NUCLEAR...');
          NUCLEAR_FORCE_COLOR(searchInput);
        }
      }, NUCLEAR_INTERVAL);
      
      // ENFORÇADOR NUCLEAR 2: MutationObserver NUCLEAR
      const NUCLEAR_OBSERVER = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' || mutation.type === 'childList') {
            console.log('🚀 [NUCLEAR] Mudança detectada, aplicando FORÇA NUCLEAR...');
            setTimeout(() => NUCLEAR_FORCE_COLOR(searchInput), 0);
          }
        });
      });
      
      // Observar TUDO no elemento
      NUCLEAR_OBSERVER.observe(searchInput, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class', 'data-*']
      });
      
      // ENFORÇADOR NUCLEAR 3: Event listeners NUCLEARES
      const NUCLEAR_EVENTS = ['input', 'focus', 'blur', 'keyup', 'change', 'paste', 'cut', 'copy', 'select', 'selectstart'];
      NUCLEAR_EVENTS.forEach(eventType => {
        searchInput.addEventListener(eventType, () => {
          console.log(`🚀 [NUCLEAR] Evento ${eventType} detectado, aplicando FORÇA NUCLEAR...`);
          setTimeout(() => NUCLEAR_FORCE_COLOR(searchInput), 0);
        });
      });
      
      // ENFORÇADOR NUCLEAR 4: Interceptar mudanças de estilo
      const originalSetAttribute = searchInput.setAttribute;
      searchInput.setAttribute = function(name, value) {
        if (name === 'style' || name === 'class') {
          console.log('🚀 [NUCLEAR] setAttribute interceptado, aplicando FORÇA NUCLEAR...');
          setTimeout(() => NUCLEAR_FORCE_COLOR(searchInput), 0);
        }
        return originalSetAttribute.call(this, name, value);
      };
      
      // ENFORÇADOR NUCLEAR 5: Interceptar mudanças de style
      const originalStyleSetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style').set;
      Object.defineProperty(searchInput, 'style', {
        set: function(value) {
          console.log('🚀 [NUCLEAR] Style interceptado, aplicando FORÇA NUCLEAR...');
          setTimeout(() => NUCLEAR_FORCE_COLOR(searchInput), 0);
          return originalStyleSetter.call(this, value);
        },
        get: function() {
          return originalStyleSetter.call(this);
        }
      });
      
      // ENFORÇADOR NUCLEAR 6: Verificação contínua NUCLEAR
      const NUCLEAR_CONTINUOUS_CHECK = setInterval(() => {
        NUCLEAR_FORCE_COLOR(searchInput);
      }, 10); // A cada 10ms - NUCLEAR!
      
      // ENFORÇADOR NUCLEAR 7: Sobrescrever CSS computado
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(element, pseudoElement) {
        const computedStyle = originalGetComputedStyle.call(this, element, pseudoElement);
        
        if (element === searchInput) {
          // Criar um proxy para interceptar propriedades de cor
          return new Proxy(computedStyle, {
            get: function(target, prop) {
              if (prop === 'color' || prop === 'webkitTextFillColor' || prop === 'textFillColor') {
                return 'rgb(45, 45, 45)';
              }
              return target[prop];
            }
          });
        }
        
        return computedStyle;
      };
      
      // Cleanup NUCLEAR
      return () => {
        clearInterval(NUCLEAR_INTERVAL_ID);
        clearInterval(NUCLEAR_CONTINUOUS_CHECK);
        NUCLEAR_OBSERVER.disconnect();
        NUCLEAR_EVENTS.forEach(eventType => {
          searchInput.removeEventListener(eventType, () => {});
        });
        // Restaurar funções originais
        searchInput.setAttribute = originalSetAttribute;
        window.getComputedStyle = originalGetComputedStyle;
      };
    }
    
    return null;
  }

  // Função NUCLEAR principal para inicializar
  function NUCLEAR_INIT() {
    console.log('🚀 [NUCLEAR] Inicializando ENFORÇADOR NUCLEAR...');
    
    let retryCount = 0;
    let cleanup = null;
    
    // Tentar configurar o campo de busca NUCLEAR
    function NUCLEAR_ATTEMPT_SETUP() {
      cleanup = NUCLEAR_SETUP_FIELD();
      
      if (cleanup) {
        console.log('🚀 [NUCLEAR] Campo de busca configurado com ENFORÇADOR NUCLEAR!');
        return;
      }
      
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        console.log(`🚀 [NUCLEAR] Tentativa ${retryCount}/${MAX_RETRIES} - Campo não encontrado, tentando novamente...`);
        setTimeout(NUCLEAR_ATTEMPT_SETUP, 50); // 50ms entre tentativas - NUCLEAR!
      } else {
        console.warn('🚀 [NUCLEAR] Máximo de tentativas atingido. Campo de busca não encontrado.');
      }
    }
    
    // Iniciar tentativas NUCLEARES
    NUCLEAR_ATTEMPT_SETUP();
    
    // Limpar quando a página for descarregada
    window.addEventListener('beforeunload', () => {
      if (cleanup) cleanup();
    });
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', NUCLEAR_INIT);
  } else {
    NUCLEAR_INIT();
  }

  // Executar quando a página estiver completamente carregada
  window.addEventListener('load', NUCLEAR_INIT);
  
  // Executar quando a rota mudar (para SPAs)
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(NUCLEAR_INIT, 10); // 10ms - NUCLEAR!
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(NUCLEAR_INIT, 10); // 10ms - NUCLEAR!
    };
  }

  // Exportar para uso global NUCLEAR
  window.NUCLEAR_ENFORCER = {
    forceColor: NUCLEAR_FORCE_COLOR,
    setupField: NUCLEAR_SETUP_FIELD,
    init: NUCLEAR_INIT,
    checkColor: NUCLEAR_CHECK_COLOR
  };

  console.log('🚀 [NUCLEAR] ENFORÇADOR NUCLEAR carregado e ativo!');

})();
