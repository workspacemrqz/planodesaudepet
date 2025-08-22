/**
 * SCRIPT DE TESTE PARA VERIFICAR A COR DO CAMPO DE BUSCA
 * Testa se a cor #2d2d2d está sendo aplicada corretamente
 */

(function() {
  'use strict';

  console.log('🧪 [TEST] Iniciando testes do campo de busca...');

  // Função para testar a cor do campo de busca
  function testSearchFieldColor() {
    const searchInput = document.querySelector('input[data-testid="input-search-units"]');
    
    if (!searchInput) {
      console.error('🧪 [TEST] Campo de busca não encontrado!');
      return false;
    }

    console.log('🧪 [TEST] Campo de busca encontrado:', searchInput);

    // Verificar se a classe CSS específica está aplicada
    const hasSpecificClass = searchInput.classList.contains('search-field-text-color-fix');
    console.log('🧪 [TEST] Classe CSS específica aplicada:', hasSpecificClass);

    // Verificar estilos inline
    const inlineColor = searchInput.style.color;
    const inlineWebkitColor = searchInput.style.webkitTextFillColor;
    const inlineCaretColor = searchInput.style.caretColor;
    
    console.log('🧪 [TEST] Estilos inline:');
    console.log('  - color:', inlineColor);
    console.log('  - webkitTextFillColor:', inlineWebkitColor);
    console.log('  - caretColor:', inlineCaretColor);

    // Verificar estilos computados
    const computedStyle = window.getComputedStyle(searchInput);
    const computedColor = computedStyle.color;
    const computedWebkitColor = computedStyle.webkitTextFillColor;
    const computedCaretColor = computedStyle.caretColor;
    
    console.log('🧪 [TEST] Estilos computados:');
    console.log('  - color:', computedColor);
    console.log('  - webkitTextFillColor:', computedWebkitColor);
    console.log('  - caretColor:', computedCaretColor);

    // Verificar se a cor está correta
    const isColorCorrect = computedColor === 'rgb(45, 45, 45)' || 
                           computedWebkitColor === 'rgb(45, 45, 45)' ||
                           computedColor === '#2d2d2d' ||
                           computedWebkitColor === '#2d2d2d';

    console.log('🧪 [TEST] Cor está correta (#2d2d2d):', isColorCorrect);

    // Verificar placeholder
    const placeholderColor = computedStyle.getPropertyValue('--search-input-color');
    console.log('🧪 [TEST] Variável CSS --search-input-color:', placeholderColor);

    // Testar interação
    console.log('🧪 [TEST] Testando interação...');
    
    // Simular foco
    searchInput.focus();
    setTimeout(() => {
      const focusColor = window.getComputedStyle(searchInput).color;
      console.log('🧪 [TEST] Cor durante foco:', focusColor);
      
      // Simular digitação
      searchInput.value = 'teste';
      searchInput.dispatchEvent(new Event('input'));
      
      setTimeout(() => {
        const inputColor = window.getComputedStyle(searchInput).color;
        console.log('🧪 [TEST] Cor durante digitação:', inputColor);
        
        // Simular blur
        searchInput.blur();
        setTimeout(() => {
          const blurColor = window.getComputedStyle(searchInput).color;
          console.log('🧪 [TEST] Cor após blur:', blurColor);
          
          // Resultado final
          const finalTest = isColorCorrect && 
                           focusColor === 'rgb(45, 45, 45)' && 
                           inputColor === 'rgb(45, 45, 45)' && 
                           blurColor === 'rgb(45, 45, 45)';
          
          console.log('🧪 [TEST] RESULTADO FINAL:', finalTest ? '✅ SUCESSO' : '❌ FALHA');
          
          if (finalTest) {
            console.log('🎉 [TEST] Campo de busca funcionando perfeitamente com cor #2d2d2d!');
          } else {
            console.warn('⚠️ [TEST] Alguns testes falharam. Verificar implementação.');
          }
        }, 100);
      }, 100);
    }, 100);

    return isColorCorrect;
  }

  // Função para executar testes em intervalos
  function runTests() {
    console.log('🧪 [TEST] Executando testes...');
    
    let testCount = 0;
    const maxTests = 10;
    
    const testInterval = setInterval(() => {
      testCount++;
      console.log(`🧪 [TEST] Execução ${testCount}/${maxTests}`);
      
      const result = testSearchFieldColor();
      
      if (result || testCount >= maxTests) {
        clearInterval(testInterval);
        console.log('🧪 [TEST] Testes concluídos.');
      }
    }, 1000);
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
  } else {
    runTests();
  }

  // Executar quando a página estiver completamente carregada
  window.addEventListener('load', runTests);

  // Exportar para uso global
  window.TestSearchFieldColor = {
    test: testSearchFieldColor,
    runTests: runTests
  };

})();
