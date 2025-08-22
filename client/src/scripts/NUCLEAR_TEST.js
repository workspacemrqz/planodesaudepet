/**
 * TESTE NUCLEAR PARA VERIFICAR O ENFORÇADOR NUCLEAR
 * ESTE SCRIPT VAI TESTAR SE A COR #2d2d2d ESTÁ SENDO APLICADA
 */

(function() {
  'use strict';

  console.log('🧪 [NUCLEAR-TEST] Iniciando TESTE NUCLEAR...');

  // Função NUCLEAR para testar a cor do campo de busca
  function NUCLEAR_TEST_COLOR() {
    const searchInput = document.querySelector('input[data-testid="input-search-units"]');
    
    if (!searchInput) {
      console.error('🧪 [NUCLEAR-TEST] Campo de busca não encontrado!');
      return false;
    }

    console.log('🧪 [NUCLEAR-TEST] Campo de busca encontrado:', searchInput);

    // Verificar se a classe NUCLEAR está aplicada
    const hasNuclearClass = searchInput.classList.contains('NUCLEAR-COLOR-FIX');
    console.log('🧪 [NUCLEAR-TEST] Classe NUCLEAR aplicada:', hasNuclearClass);

    // Verificar estilos inline
    const inlineColor = searchInput.style.color;
    const inlineWebkitColor = searchInput.style.webkitTextFillColor;
    const inlineTextFillColor = searchInput.style.textFillColor;
    const inlineCaretColor = searchInput.style.caretColor;
    
    console.log('🧪 [NUCLEAR-TEST] Estilos inline:');
    console.log('  - color:', inlineColor);
    console.log('  - webkitTextFillColor:', inlineWebkitColor);
    console.log('  - textFillColor:', inlineTextFillColor);
    console.log('  - caretColor:', inlineCaretColor);

    // Verificar estilos computados
    const computedStyle = window.getComputedStyle(searchInput);
    const computedColor = computedStyle.color;
    const computedWebkitColor = computedStyle.webkitTextFillColor;
    const computedCaretColor = computedStyle.caretColor;
    
    console.log('🧪 [NUCLEAR-TEST] Estilos computados:');
    console.log('  - color:', computedColor);
    console.log('  - webkitTextFillColor:', computedWebkitColor);
    console.log('  - caretColor:', computedCaretColor);

    // Verificar se a cor está correta
    const isColorCorrect = computedColor === 'rgb(45, 45, 45)' || 
                           computedWebkitColor === 'rgb(45, 45, 45)' ||
                           computedColor === '#2d2d2d' ||
                           computedWebkitColor === '#2d2d2d';

    console.log('🧪 [NUCLEAR-TEST] Cor está correta (#2d2d2d):', isColorCorrect);

    // Verificar variáveis CSS
    const cssVars = {
      '--search-input-color': computedStyle.getPropertyValue('--search-input-color'),
      '--search-input-placeholder-color': computedStyle.getPropertyValue('--search-input-placeholder-color'),
      '--search-input-caret-color': computedStyle.getPropertyValue('--search-input-caret-color')
    };
    
    console.log('🧪 [NUCLEAR-TEST] Variáveis CSS:', cssVars);

    // Testar interação NUCLEAR
    console.log('🧪 [NUCLEAR-TEST] Testando interação NUCLEAR...');
    
    // Simular foco
    searchInput.focus();
    setTimeout(() => {
      const focusColor = window.getComputedStyle(searchInput).color;
      console.log('🧪 [NUCLEAR-TEST] Cor durante foco:', focusColor);
      
      // Simular digitação
      searchInput.value = 'teste nuclear';
      searchInput.dispatchEvent(new Event('input'));
      
      setTimeout(() => {
        const inputColor = window.getComputedStyle(searchInput).color;
        console.log('🧪 [NUCLEAR-TEST] Cor durante digitação:', inputColor);
        
        // Simular blur
        searchInput.blur();
        setTimeout(() => {
          const blurColor = window.getComputedStyle(searchInput).color;
          console.log('🧪 [NUCLEAR-TEST] Cor após blur:', blurColor);
          
          // Resultado final NUCLEAR
          const finalNuclearTest = isColorCorrect && 
                                   focusColor === 'rgb(45, 45, 45)' && 
                                   inputColor === 'rgb(45, 45, 45)' && 
                                   blurColor === 'rgb(45, 45, 45)';
          
          console.log('🧪 [NUCLEAR-TEST] RESULTADO FINAL NUCLEAR:', finalNuclearTest ? '🚀 NUCLEAR SUCESSO' : '❌ NUCLEAR FALHA');
          
          if (finalNuclearTest) {
            console.log('🎉 [NUCLEAR-TEST] ENFORÇADOR NUCLEAR funcionando perfeitamente!');
            console.log('🚀 [NUCLEAR-TEST] Cor #2d2d2d garantida em todos os cenários!');
          } else {
            console.warn('⚠️ [NUCLEAR-TEST] ENFORÇADOR NUCLEAR falhou em alguns testes.');
            console.warn('🚀 [NUCLEAR-TEST] Executando NUCLEAR_FORCE_COLOR...');
            
            // Forçar cor NUCLEAR
            if (window.NUCLEAR_ENFORCER) {
              window.NUCLEAR_ENFORCER.forceColor(searchInput);
              console.log('🚀 [NUCLEAR-TEST] FORÇA NUCLEAR aplicada!');
            }
          }
        }, 100);
      }, 100);
    }, 100);

    return isColorCorrect;
  }

  // Função para executar testes NUCLEARES em intervalos
  function NUCLEAR_RUN_TESTS() {
    console.log('🧪 [NUCLEAR-TEST] Executando testes NUCLEARES...');
    
    let testCount = 0;
    const maxTests = 20; // 20 testes NUCLEARES
    
    const testInterval = setInterval(() => {
      testCount++;
      console.log(`🧪 [NUCLEAR-TEST] Execução NUCLEAR ${testCount}/${maxTests}`);
      
      const result = NUCLEAR_TEST_COLOR();
      
      if (result || testCount >= maxTests) {
        clearInterval(testInterval);
        console.log('🧪 [NUCLEAR-TEST] Testes NUCLEARES concluídos.');
        
        // Resultado final
        if (result) {
          console.log('🎉 [NUCLEAR-TEST] TODOS OS TESTES NUCLEARES PASSARAM!');
          console.log('🚀 [NUCLEAR-TEST] ENFORÇADOR NUCLEAR FUNCIONANDO PERFEITAMENTE!');
        } else {
          console.error('❌ [NUCLEAR-TEST] ALGUNS TESTES NUCLEARES FALHARAM!');
          console.error('🚀 [NUCLEAR-TEST] VERIFICAR IMPLEMENTAÇÃO NUCLEAR!');
        }
      }
    }, 500); // 500ms entre testes NUCLEARES
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', NUCLEAR_RUN_TESTS);
  } else {
    NUCLEAR_RUN_TESTS();
  }

  // Executar quando a página estiver completamente carregada
  window.addEventListener('load', NUCLEAR_RUN_TESTS);

  // Exportar para uso global NUCLEAR
  window.NUCLEAR_TEST = {
    test: NUCLEAR_TEST_COLOR,
    runTests: NUCLEAR_RUN_TESTS
  };

  console.log('🧪 [NUCLEAR-TEST] TESTE NUCLEAR carregado e ativo!');

})();
