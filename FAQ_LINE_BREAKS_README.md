# Sistema de FAQ com Suporte a Quebras de Linha

## Visão Geral

O sistema de FAQ foi atualizado para suportar completamente quebras de linha e formatação de texto multilinha, permitindo que os administradores criem perguntas e respostas com melhor legibilidade e estrutura.

## Funcionalidades Implementadas

### 1. Suporte a Quebras de Linha
- **Preservação completa** de `\n`, `\r\n` e `\r`
- **Normalização automática** para formato `\n` no backend
- **Sanitização inteligente** que remove scripts maliciosos mas preserva formatação

### 2. Componentes Avançados
- **AdvancedTextarea**: Textarea com auto-resize e preview em tempo real
- **FormattedText**: Componente para exibição de texto com quebras preservadas
- **CharacterCounter**: Contador de caracteres que considera quebras de linha

### 3. Validação Melhorada
- **Limites de caracteres**: Pergunta (500) e Resposta (2000)
- **Contagem precisa** incluindo quebras de linha
- **Mensagens de erro** claras e informativas

## Como Usar

### Criando/Editando FAQ

1. **Campo Pergunta**:
   - Digite normalmente, use Enter para quebras de linha
   - Máximo: 500 caracteres
   - Preview em tempo real disponível

2. **Campo Resposta**:
   - Suporte completo a múltiplas linhas
   - Máximo: 2000 caracteres
   - Auto-resize conforme conteúdo

3. **Preview**:
   - Clique no botão "👁️ Preview" para ver como ficará
   - Clique em "✏️ Editar" para voltar à edição

### Exemplos de Formatação

```
Pergunta:
Como funciona o plano de saúde para pets?

Resposta:
O plano de saúde para pets funciona da seguinte forma:

1. **Cadastro**: 
   - Informações do pet
   - Dados do tutor
   - Escolha do plano

2. **Ativação**:
   - Período de carência
   - Cobertura imediata para emergências

3. **Utilização**:
   - Rede credenciada
   - Reembolso para consultas
```

## Características Técnicas

### Backend
- **Sanitização**: Remove scripts maliciosos, preserva quebras
- **Validação**: Aceita `\n`, `\r\n`, `\r` como caracteres válidos
- **Armazenamento**: Banco de dados preserva formatação original
- **API**: Respostas mantêm quebras de linha intactas

### Frontend
- **CSS**: `white-space: pre-wrap` para preservar formatação
- **Componentes**: Renderização automática de quebras como `<br>`
- **Responsivo**: Funciona em dispositivos móveis e desktop
- **Acessibilidade**: Suporte a navegação por teclado

## Limitações e Considerações

### Limites de Caracteres
- **Pergunta**: 500 caracteres (incluindo quebras)
- **Resposta**: 2000 caracteres (incluindo quebras)
- **Contadores visuais** mostram uso em tempo real

### Compatibilidade
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, mobile
- **Encoding**: UTF-8 para caracteres especiais

### Performance
- **Auto-resize**: Otimizado para não impactar performance
- **Preview**: Atualização em tempo real sem lag
- **Validação**: Client-side para feedback imediato

## Troubleshooting

### Problemas Comuns

1. **Quebras não aparecem**:
   - Verifique se está usando Enter (não Shift+Enter)
   - Confirme que o texto foi salvo corretamente
   - Teste o preview antes de salvar

2. **Contador incorreto**:
   - Quebras de linha são contadas como 1 caractere cada
   - Espaços múltiplos são normalizados
   - Caracteres especiais são contados corretamente

3. **Preview não funciona**:
   - Verifique se o JavaScript está habilitado
   - Recarregue a página se necessário
   - Confirme que os componentes foram carregados

### Logs e Debug
- **Console**: Mensagens detalhadas para desenvolvimento
- **Network**: Verifique se as requisições estão corretas
- **Database**: Confirme que os dados estão sendo salvos

## Manutenção

### Atualizações
- **Schema**: Validação automática de novos campos
- **Componentes**: Compatibilidade com versões futuras
- **API**: Endpoints mantêm compatibilidade

### Monitoramento
- **Logs**: Acompanhe erros de validação
- **Performance**: Monitore tempo de resposta
- **Usabilidade**: Feedback dos usuários administrativos

## Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Teste com diferentes tipos de conteúdo
3. Consulte os logs do sistema
4. Entre em contato com a equipe técnica

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Compatibilidade**: FAQ System v2.0+
