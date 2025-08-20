# Debug - Serviços após Implantação

## 🔍 Logs Adicionados

Adicionei logs detalhados para identificar onde está o problema:

### 1. Console Logs do Browser (F12)

Ao acessar a página `/admin` → Rede Credenciada → Nova Unidade:

```
[SERVICES DEBUG] Available services count: 37
[SERVICES DEBUG] First 3 services: [...]
```

### 2. Logs dos Checkboxes (Passo 3)

Quando chegar no Passo 3:

```
[CHECKBOX RENDER] Service 0: Consulta clínica geral
[CHECKBOX RENDER] Service 1: Consulta especializada...
...
```

### 3. Logs de Seleção

Ao clicar em um checkbox:

```
[SERVICE TOGGLE] Service: Consulta clínica geral
[SERVICE TOGGLE] Updated services: ["Consulta clínica geral"]
```

### 4. Logs de Submit

Ao salvar a unidade:

```
[SUBMIT DEBUG] Selected services: ["Consulta clínica geral", ...]
[SUBMIT DEBUG] Services count: 2
[SUBMIT DEBUG] Unit data: { services: [...], ... }
```

## 🚨 Possíveis Problemas

### Problema 1: JavaScript Error
**Sintoma**: Nenhum log aparece
**Causa**: Erro de JavaScript quebrou a página
**Solução**: Verificar console do browser para erros

### Problema 2: Lista Vazia
**Sintoma**: `Available services count: 0`
**Causa**: AVAILABLE_SERVICES não está sendo importado
**Solução**: Verificar se a constante está definida

### Problema 3: Checkboxes Não Aparecem
**Sintoma**: Logs de serviços aparecem, mas não os de CHECKBOX RENDER
**Causa**: Componente não está chegando no Passo 3
**Solução**: Verificar navegação entre passos

### Problema 4: Checkboxes Não Funcionam
**Sintoma**: Checkboxes aparecem mas SERVICE TOGGLE não funciona
**Causa**: Event handlers não conectados
**Solução**: Verificar função handleServiceToggle

### Problema 5: Submit Não Envia Serviços
**Sintoma**: SUBMIT DEBUG mostra services: []
**Causa**: selectedServices não está sendo populado
**Solução**: Verificar estado selectedServices

## 📋 Checklist de Debug

1. [ ] Abrir console do browser (F12)
2. [ ] Navegar para /admin → Rede Credenciada
3. [ ] Clicar em "Nova Unidade"
4. [ ] Verificar logs iniciais
5. [ ] Navegar até Passo 3
6. [ ] Verificar se checkboxes aparecem
7. [ ] Clicar em alguns checkboxes
8. [ ] Verificar logs de toggle
9. [ ] Tentar salvar unidade
10. [ ] Verificar logs de submit

## 🔧 Debug por Etapas

### Etapa 1: Página Carrega?
- Logs esperados: `[SERVICES DEBUG] Available services count: 37`
- Se não aparecer: Problema no carregamento da página

### Etapa 2: Passo 3 Carrega?
- Logs esperados: `[CHECKBOX RENDER] Service 0: ...`
- Se não aparecer: Problema na navegação para Passo 3

### Etapa 3: Checkboxes Funcionam?
- Ação: Clicar em checkbox
- Logs esperados: `[SERVICE TOGGLE] Service: ...`
- Se não aparecer: Problema nos event handlers

### Etapa 4: Submit Funciona?
- Ação: Tentar salvar
- Logs esperados: `[SUBMIT DEBUG] Selected services: [...]`
- Se array vazio: Problema no estado selectedServices
