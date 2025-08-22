# 🚀 UNIPET PLAN - Deploy no EasyPanel

## 📋 Resumo

Este projeto está configurado para deploy automático no EasyPanel usando Buildpacks Heroku. Todas as configurações necessárias foram otimizadas para garantir um deploy bem-sucedido.

## ✅ Problemas Resolvidos

### 1. Erro de TypeScript no Login Administrativo
- ✅ **Problema**: Duplicação de tipos `LoginData` causando erro de tipagem
- ✅ **Solução**: Tipo centralizado no hook `useAdminAuth` e importado corretamente
- ✅ **Validação**: Adicionada validação robusta para campos obrigatórios

### 2. Configuração de Build Otimizada
- ✅ **Scripts**: Adicionados scripts de fallback e retry
- ✅ **TypeScript**: Configuração permissiva para build de produção
- ✅ **Fallback**: Build alternativo caso o principal falhe

### 3. Configuração para EasyPanel
- ✅ **Dockerfile**: Otimizado com retry e health check
- ✅ **Procfile**: Configurado corretamente para produção
- ✅ **Health Check**: Endpoint `/api/health` funcionando
- ✅ **Scripts**: Scripts de deploy e verificação

## 🚀 Deploy Rápido

### 1. Preparar o Projeto
```bash
# No servidor, execute:
./scripts/easypanel-deploy.sh
```

### 2. Configurar no EasyPanel
- **Builder**: `heroku/builder:24`
- **Build Command**: `npm run build`
- **Start Command**: `node server/start-production.js`
- **Port**: `8080`

### 3. Variáveis de Ambiente
```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=admin@example.com
SENHA=your_secure_password_here_min_12_chars
SESSION_SECRET=your_session_secret_here_min_32_chars
```

## 🔧 Scripts Disponíveis

### Build e Deploy
```bash
npm run build          # Build principal
npm run build:fallback # Build alternativo
npm run build:retry    # Build com retry
npm run deploy:build   # Build para deploy
```

### Verificação
```bash
npm run check          # Verificação de tipos
npm run check:strict   # Verificação estrita
npm run health:check   # Health check completo
```

### Testes
```bash
npm run test           # Testes unitários
npm run test:production # Testes de produção
npm run test:startup   # Testes de inicialização
```

## 📁 Arquivos de Configuração

### EasyPanel
- `easypanel.yml` - Configuração principal
- `easypanel-buildpack.yml` - Configuração com Buildpacks
- `easypanel-config.md` - Documentação detalhada

### Docker
- `Dockerfile` - Otimizado para produção
- `docker-compose.yml` - Para desenvolvimento local

### Build
- `tsconfig.build.json` - TypeScript para produção
- `vite.config.simple.ts` - Vite para produção
- `Procfile` - Comando de start

## 🚨 Troubleshooting

### Build Falhou
```bash
# Verificar tipos
npm run check

# Build alternativo
npm run build:fallback

# Verificar logs
npm run health:check
```

### Container Não Inicia
```bash
# Health check
npm run health:check

# Verificar variáveis de ambiente
cat env.example

# Verificar logs
docker logs <container_id>
```

### Aplicação Não Responde
```bash
# Health check
curl -f --connect-timeout 2 --max-time 5 http://localhost:8080/api/health

# Verificar porta
netstat -tlnp | grep 8080
```

## 📊 Monitoramento

### Health Check
- **Endpoint**: `GET /api/health`
- **Intervalo**: 30s
- **Timeout**: 10s
- **Retries**: 3

### Logs
- **EasyPanel**: Aba Logs
- **Container**: `docker logs <container_id>`
- **Aplicação**: Console do servidor

## 🔄 Atualizações

### Deploy Automático
1. Push para repositório
2. EasyPanel detecta mudanças
3. Build automático
4. Deploy automático

### Deploy Manual
```bash
# No servidor
git pull
./scripts/easypanel-deploy.sh
# Deploy via EasyPanel
```

## 📚 Documentação Adicional

- `easypanel-deploy.md` - Guia completo de deploy
- `easypanel-config.md` - Configurações avançadas
- `README_DEPLOY.md` - Documentação geral de deploy
- `scripts/easypanel-deploy.sh` - Script de deploy

## 🌐 URLs

- **Aplicação**: http://localhost:8080
- **Admin**: http://localhost:8080/admin
- **Health Check**: http://localhost:8080/api/health

## ✅ Checklist de Deploy

- [ ] Script de deploy executado
- [ ] Variáveis de ambiente configuradas
- [ ] Builder `heroku/builder:24` selecionado
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Porta 8080 configurada
- [ ] Health check respondendo
- [ ] Aplicação acessível
- [ ] Banco de dados conectando
- [ ] Uploads funcionando

---

**Status**: ✅ Configurado e testado para EasyPanel  
**Última atualização**: $(date)  
**Versão**: 1.0.0
