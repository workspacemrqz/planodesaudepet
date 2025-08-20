# Deploy no EasyPanel - Guia Completo

## Correções Aplicadas

### 1. **Build Duplicado Removido**
- Removido o script `postinstall` do package.json que estava causando build duplicado
- Mantido apenas `heroku-postbuild` para o processo de build

### 2. **Configuração de Porta Corrigida**
- Alterada porta padrão de produção de 80 para 8080
- O servidor agora usa `process.env.PORT` ou 8080 como fallback
- Host configurado para '0.0.0.0' em produção

### 3. **Servir Arquivos Estáticos Melhorado**
- Implementada busca em múltiplos caminhos possíveis para o diretório de build
- Adicionado logging detalhado para debug em produção
- Melhor tratamento de erros ao servir arquivos

### 4. **Configuração NPM**
- Criado arquivo `.npmrc` para resolver avisos de configuração
- Configurações otimizadas para build de produção

### 5. **Vite Config Ajustado**
- Adicionada configuração `base: '/'` para paths corretos dos assets
- Garantido que o diretório uploads seja criado após o build

### 6. **Script de Inicialização Robusto**
- Criado `server/start-production.js` com diagnóstico detalhado
- Verifica existência de arquivos antes de iniciar
- Logging melhorado para debug

### 7. **Endpoint de Diagnóstico**
- Adicionado `/api/diagnostic` para verificar status do servidor
- Retorna informações sobre paths, variáveis de ambiente e arquivos

## Como Fazer o Deploy no EasyPanel

### Passo 1: Preparar o Código
```bash
# Certifique-se de que todas as mudanças estão commitadas
git add .
git commit -m "Fix production deployment for EasyPanel"
git push origin main
```

### Passo 2: Configurar no EasyPanel

1. **Criar novo App**
   - Escolha "GitHub" como fonte
   - Selecione seu repositório

2. **Configurar Build**
   - Método: `Buildpacks`
   - Builder: `heroku/builder:24`
   - Build Command: deixe vazio (usa heroku-postbuild automaticamente)

3. **Variáveis de Ambiente**
   Adicione as seguintes variáveis:
   ```
   NODE_ENV=production
   DATABASE_URL=sua_url_do_banco_postgres
   NPM_CONFIG_PRODUCTION=false
   ```

4. **Configurar Domínio**
   - Configure seu domínio personalizado ou use o subdomínio fornecido

### Passo 3: Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Verifique os logs para garantir que não há erros

### Passo 4: Verificar Deploy

1. **Teste o endpoint de diagnóstico:**
   ```
   https://seu-dominio.com/api/diagnostic
   ```
   
2. **Verifique se o site está funcionando:**
   ```
   https://seu-dominio.com
   ```

## Troubleshooting

### Site não carrega

1. Verifique o endpoint `/api/diagnostic` para ver se os arquivos existem
2. Verifique os logs no EasyPanel para erros
3. Certifique-se de que a variável `DATABASE_URL` está configurada

### Erro 404 nos assets

1. Verifique se o build foi executado corretamente
2. Use o endpoint `/api/diagnostic` para verificar se os arquivos estão no lugar certo
3. Verifique se a pasta `dist/public/assets` existe

### Banco de dados não conecta

1. Verifique se `DATABASE_URL` está configurada corretamente
2. Certifique-se de que o banco PostgreSQL está acessível
3. Verifique os logs para erros de conexão

## Comandos Úteis

```bash
# Build local para teste
npm run build

# Testar servidor de produção localmente
npm run start

# Verificar se o build está correto
ls -la dist/public/

# Limpar e reconstruir
rm -rf dist node_modules
npm install
npm run build
```

## Estrutura de Arquivos Esperada Após Build

```
dist/
├── index.js          # Servidor compilado
└── public/           # Arquivos estáticos
    ├── index.html    # HTML principal
    ├── assets/       # JS/CSS compilados
    │   ├── *.js
    │   └── *.css
    └── uploads/      # Diretório para uploads
```

## Logs Importantes para Monitorar

Durante o deploy, procure por estas mensagens nos logs:

✅ **Sucesso:**
- `[PRODUCTION] Found build directory at: /workspace/dist/public`
- `[PRODUCTION] Files in public directory: [...]`
- `serving on http://0.0.0.0:PORT`
- `✅ Database initialization completed successfully!`

❌ **Problemas:**
- `[ERROR] Build directory not found`
- `Failed to connect to database`
- `Error serving index.html`

## Contato e Suporte

Se encontrar problemas após seguir este guia:

1. Verifique os logs completos no EasyPanel
2. Acesse `/api/diagnostic` para informações detalhadas
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Certifique-se de que o build foi executado com sucesso

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0.0
