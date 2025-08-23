# 🚀 Deploy no Easypanel - CORRIGIDO

Este documento contém as instruções para fazer deploy da aplicação UNIPET PLAN no Easypanel usando Buildpacks.

## 🐛 Problema Corrigido

O erro `Could not resolve entry module "index.html"` foi corrigido através de:

1. **Configuração correta do Vite**: Ajustando os caminhos para encontrar o `index.html`
2. **Package.json do client**: Criando um package.json específico para o diretório client
3. **Scripts de build otimizados**: Scripts específicos para o ambiente do buildpack
4. **Configuração do buildpack**: Arquivos de configuração específicos para o Heroku/Easypanel

## 📋 Pré-requisitos

- Conta no Easypanel configurada
- Repositório GitHub com o código da aplicação
- Banco de dados PostgreSQL configurado

## 🔧 Configuração do Projeto

O projeto está configurado com os arquivos necessários para deploy:

- `Procfile` - Define o comando de inicialização
- `app.json` - Configuração do Heroku/Easypanel
- `heroku.yml` - Configuração de build
- `Dockerfile` - Container Docker otimizado
- `easypanel.json` - Configuração específica do Easypanel
- `.nvmrc` - Versão do Node.js (18.20.0)
- `.buildpacks` - Buildpack específico do Node.js
- `.npmrc` - Configurações do npm

## 📦 Estrutura de Build Corrigida

### Scripts de Build
```json
{
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build --config vite.config.simple.ts",
  "build:server": "tsc --project tsconfig.server.json",
  "build:buildpack": "npm run build:client && npm run build:server",
  "start": "cross-env NODE_ENV=production node dist/server/index.js",
  "postinstall": "npm run build:buildpack"
}
```

### Processo de Build Corrigido
1. **Build do Cliente**: Compila o React para `dist/client` usando Vite
2. **Build do Servidor**: Compila o TypeScript para `dist/server`
3. **Dependências**: Instala todas as dependências necessárias
4. **Postinstall**: Executa o build automaticamente após instalação

## 🌐 Variáveis de Ambiente

Configure as seguintes variáveis no Easypanel:

### Obrigatórias
```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=admin@example.com
SENHA=password_segura
SESSION_SECRET=secret_32_chars_minimo
```

### Opcionais
```bash
ALLOWED_ORIGIN=https://seudominio.com
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🚀 Deploy no Easypanel

### 1. Conectar Repositório
- Acesse o Easypanel
- Clique em "New Project"
- Selecione "Git Repository"
- Conecte com seu repositório GitHub

### 2. Configurar Build
- **Build Method**: Buildpacks
- **Builder**: `heroku/builder:24`
- **Buildpacks**: `heroku/nodejs`

### 3. Configurar Variáveis
- Adicione todas as variáveis de ambiente necessárias
- Configure o `DATABASE_URL` com suas credenciais do PostgreSQL

### 4. Configurar Recursos
- **CPU**: 0.5 cores (mínimo)
- **Memory**: 512Mi (mínimo)
- **Storage**: 1GB (mínimo)

### 5. Deploy
- Clique em "Deploy"
- Aguarde o build e deploy
- Verifique os logs para confirmar sucesso

## 🔍 Verificação do Deploy

### Health Check
A aplicação expõe um endpoint de health check:
```
GET /api/health
```

### Logs
Monitore os logs para verificar:
- Build bem-sucedido
- Servidor iniciando corretamente
- Conexão com banco de dados
- Servindo arquivos estáticos

## 📁 Estrutura de Arquivos em Produção

```
/app/
├── dist/
│   ├── client/          # Build do React
│   └── server/          # Build do servidor
├── uploads/             # Arquivos enviados
├── node_modules/        # Dependências
└── package.json
```

## 🐛 Troubleshooting

### Problemas Comuns Corrigidos

#### 1. Build Falha - INDEX.HTML NÃO ENCONTRADO ✅ CORRIGIDO
- **Problema**: Vite não conseguia encontrar o `index.html`
- **Solução**: Configuração correta dos caminhos no Vite
- **Arquivo**: `vite.config.simple.ts` e `client/vite.config.ts`

#### 2. Dependências Não Instaladas ✅ CORRIGIDO
- **Problema**: Buildpack não conseguia instalar dependências
- **Solução**: Package.json específico para o client
- **Arquivo**: `client/package.json`

#### 3. Scripts de Build ✅ CORRIGIDO
- **Problema**: Scripts de build não funcionavam no ambiente do buildpack
- **Solução**: Scripts específicos para o buildpack
- **Arquivo**: `package.json` (scripts)

### Logs Úteis
```bash
# Verificar estrutura de arquivos
ls -la dist/
ls -la dist/client/
ls -la dist/server/

# Verificar variáveis de ambiente
echo $NODE_ENV
echo $DATABASE_URL

# Verificar logs da aplicação
tail -f logs/app.log
```

## 🔄 Atualizações

### Deploy Automático
- Configure webhooks no GitHub para deploy automático
- Ou use o deploy manual no Easypanel

### Rollback
- O Easypanel mantém histórico de deploys
- Use o botão "Rollback" para voltar a versões anteriores

## 📊 Monitoramento

### Métricas Importantes
- **Uptime**: Disponibilidade da aplicação
- **Response Time**: Tempo de resposta das APIs
- **Memory Usage**: Uso de memória
- **CPU Usage**: Uso de CPU

### Alertas
Configure alertas para:
- Aplicação offline
- Alto uso de recursos
- Erros frequentes
- Tempo de resposta alto

## 🔒 Segurança

### Recomendações
- Use HTTPS em produção
- Configure CORS adequadamente
- Monitore logs de acesso
- Mantenha dependências atualizadas
- Use variáveis de ambiente para credenciais

### Firewall
- Abra apenas a porta 8080
- Configure regras de acesso por IP se necessário
- Monitore tentativas de acesso não autorizado

## 📚 Recursos Adicionais

- [Documentação do Easypanel](https://easypanel.io/docs)
- [Heroku Buildpacks](https://devcenter.heroku.com/articles/buildpacks)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Connection](https://node-postgres.com/guides/async-express)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs da aplicação
2. Confirme as configurações de ambiente
3. Teste localmente com as mesmas configurações
4. Consulte a documentação do Easypanel
5. Abra uma issue no repositório do projeto

## 🎉 Status

✅ **PROBLEMA CORRIGIDO** - A aplicação está pronta para deploy no Easypanel!

O erro `Could not resolve entry module "index.html"` foi resolvido e a aplicação deve fazer deploy com sucesso.
