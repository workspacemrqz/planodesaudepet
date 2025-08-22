# 🚀 EasyPanel Configuration - UNIPET PLAN

## 📋 Configuração Rápida

### 1. Variáveis de Ambiente Obrigatórias

Configure estas variáveis no painel do EasyPanel:

```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=admin@example.com
SENHA=your_secure_password_here_min_12_chars
SESSION_SECRET=your_session_secret_here_min_32_chars
```

### 2. Configurações de Build

- **Builder**: `heroku/builder:24`
- **Build Command**: `npm run build`
- **Start Command**: `node server/start-production.js`
- **Port**: `8080`

### 3. Health Check

Endpoint de verificação de saúde:
```
GET /api/health
```

## 🔧 Configurações Avançadas

### Dockerfile
O projeto inclui um `Dockerfile` otimizado que:
- Usa o construtor `heroku/builder:24`
- Instala dependências com retry e fallback
- Builda a aplicação com configurações de produção
- Inclui health check automático

### Scripts de Deploy

#### Preparar Deploy
```bash
# Executar no servidor antes do deploy
./scripts/easypanel-deploy.sh
```

#### Health Check
```bash
# Verificar status da aplicação
npm run health:check
```

#### Build com Fallback
```bash
# Build principal
npm run build

# Build de fallback (se o principal falhar)
npm run build:fallback
```

## 📊 Monitoramento

### Logs
- Acesse a aba "Logs" no EasyPanel
- Use o terminal integrado para comandos diretos

### Status
```bash
# Verificar health check
curl -f --connect-timeout 2 --max-time 5 http://localhost:8080/api/health
```

## 🚨 Troubleshooting

### Erro: Build falhou
1. Execute `npm run check` para verificar tipos TypeScript
2. Use `npm run build:fallback` como alternativa
3. Verifique logs de build no EasyPanel

### Erro: Container não inicia
1. Verifique variáveis de ambiente
2. Confirme conectividade com banco de dados
3. Execute `npm run health:check`

### Erro: Aplicação não responde
1. Confirme porta 8080 está exposta
2. Verifique health check
3. Confirme banco de dados conectando

## 📚 Comandos Úteis

```bash
# Verificar status
docker ps

# Ver logs
docker logs <container_id>

# Acessar container
docker exec -it <container_id> /bin/bash

# Reiniciar
docker restart <container_id>

# Health check local
npm run health:check
```

## 🌐 Acesso

Após deploy bem-sucedido:
- **Local**: http://localhost:8080
- **Rede**: http://[IP_DO_SERVIDOR]:8080
- **Admin**: http://[IP_DO_SERVIDOR]:8080/admin

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Builder `heroku/builder:24` selecionado
- [ ] Build command: `npm run build`
- [ ] Start command: `node server/start-production.js`
- [ ] Porta 8080 configurada
- [ ] Health check respondendo
- [ ] Aplicação acessível via navegador
- [ ] Banco de dados conectando
- [ ] Uploads funcionando

## 🔄 Atualizações

Para atualizar a aplicação:
1. Faça push para o repositório
2. O EasyPanel detectará automaticamente
3. Execute novo deploy
4. Verifique health check

## 📞 Suporte

- **Logs**: EasyPanel > Aba Logs
- **Health Check**: `npm run health:check`
- **Documentação**: `easypanel-deploy.md`
- **Scripts**: `scripts/easypanel-deploy.sh`
