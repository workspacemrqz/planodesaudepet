# 🚀 Guia de Deployment - EasyPanel com Buildpacks

Este guia resolve os problemas críticos identificados no deployment do seu projeto no EasyPanel usando Buildpacks.

## ❌ Problemas Identificados e Resolvidos

### 1. **ERRO DE COLUNA NO BANCO DE DADOS**
- **Problema**: A tabela `plans` não tinha a coluna `image` que o código estava tentando acessar
- **Solução**: Criada migração automática que adiciona a coluna `image` como NOT NULL com valor padrão

### 2. **IMAGENS NÃO CARREGAM**
- **Problema**: Arquivos estáticos não estavam sendo servidos corretamente em produção
- **Solução**: Configuração correta do servidor e script de cópia de assets

## 🔧 Scripts de Correção Criados

### Scripts Principais
- `scripts/init-db.js` - Inicializa banco e executa migrações
- `scripts/copy-assets.js` - Copia imagens para o diretório de build
- `scripts/deployment-check.js` - Verifica se tudo está funcionando

### Scripts NPM
- `npm run db:init` - Inicializa banco de dados
- `npm run copy:assets` - Copia assets para build
- `npm run check:deployment` - Verifica deployment completo

## 📋 Processo de Deployment Corrigido

### 1. **Build Process**
```bash
# O build agora inclui automaticamente:
npm run build:server      # Compila servidor
npm run build:client      # Compila cliente
npm run copy:assets       # Copia imagens para dist/client/public
```

### 2. **Inicialização do Banco**
```bash
# Executado automaticamente após npm install
npm run postinstall       # Executa migrações do banco
```

### 3. **Servidor Configurado**
- ✅ Serve arquivos estáticos de `/assets` (arquivos compilados)
- ✅ Serve imagens de `/public` (arquivos da pasta public)
- ✅ Fallback para SPA React em rotas não-API
- ✅ Cache otimizado para produção

## 🚀 Deployment no EasyPanel

### 1. **Configuração do Buildpack**
O `easypanel.config.js` já está configurado corretamente:
- Usa `heroku/builder:24`
- Porta 8080
- Host 0.0.0.0

### 2. **Variáveis de Ambiente Necessárias**
```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://...
```

### 3. **Scripts de Build**
O `package.json` tem todos os scripts necessários:
- `heroku-prebuild`: Instala dependências do cliente
- `build`: Build completo (servidor + cliente + assets)
- `start`: Inicia o servidor

## 🔍 Verificação Pós-Deployment

### 1. **Verificar Deployment**
```bash
npm run check:deployment
```

Este comando verifica:
- ✅ Variáveis de ambiente
- ✅ Arquivos estáticos
- ✅ Conexão com banco
- ✅ Coluna `image` na tabela `plans`

### 2. **Verificar Logs**
```bash
# No EasyPanel, verifique os logs para:
- "✅ Banco de dados inicializado com sucesso"
- "✅ Arquivos estáticos configurados"
- "✅ Coluna image adicionada com sucesso"
```

### 3. **Testar Funcionalidades**
- ✅ API `/api/plans` deve retornar planos sem erro
- ✅ Imagens devem carregar de `/public/`
- ✅ Assets compilados devem carregar de `/assets/`

## 🛠️ Solução de Problemas

### Se a coluna `image` ainda não existir:
```bash
npm run db:init
```

### Se as imagens não carregarem:
```bash
npm run copy:assets
npm run build
```

### Se houver problemas de build:
```bash
# Limpar e rebuildar
rm -rf dist/
rm -rf node_modules/
npm install
npm run build
```

## 📁 Estrutura de Arquivos Corrigida

```
dist/
├── server/           # Servidor compilado
└── client/          # Cliente compilado
    ├── assets/      # Assets compilados (JS/CSS)
    ├── public/      # Imagens e arquivos estáticos
    └── index.html   # SPA React
```

## 🔒 Configurações de Segurança

- ✅ Helmet configurado
- ✅ CORS configurado
- ✅ Rate limiting ativo
- ✅ Validação de entrada
- ✅ Proteção XSS e CSRF

## 📊 Monitoramento

- ✅ Health check em `/api/health`
- ✅ Logs detalhados para debugging
- ✅ Graceful shutdown
- ✅ Tratamento de erros robusto

## 🎯 Resultado Esperado

Após aplicar essas correções:
1. ✅ O banco de dados terá a coluna `image` na tabela `plans` como NOT NULL
2. ✅ Todos os planos terão uma imagem válida (padrão: `/BASICicon.svg`)
3. ✅ As imagens serão servidas corretamente de `/public/`
4. ✅ O site funcionará perfeitamente em produção
5. ✅ Não haverá mais erros de coluna inexistente ou valores NULL

## 🆘 Suporte

Se ainda houver problemas após aplicar essas correções:
1. Execute `npm run check:deployment`
2. Verifique os logs no EasyPanel
3. Confirme que todas as variáveis de ambiente estão configuradas
4. Verifique se o banco de dados está acessível

---

**🎉 Seu projeto agora está pronto para deployment no EasyPanel!**
