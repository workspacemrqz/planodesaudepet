# 🚀 Deploy no EasyPanel - Guia Rápido

## ⚡ Deploy em 5 Passos

### 1. Preparar o Repositório
```bash
# Clone o repositório no servidor
git clone <seu-repositorio>
cd planodesaudepet

# Verifique se todos os arquivos estão presentes
ls -la
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` no servidor:
```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=admin@example.com
SENHA=your_secure_password_here_min_12_chars
SESSION_SECRET=your_session_secret_here_min_32_chars
```

### 3. Deploy via EasyPanel
1. Acesse o painel do EasyPanel
2. Clique em "New Project"
3. Selecione "Deploy from Git"
4. Cole a URL do seu repositório
5. Selecione a branch (geralmente `main` ou `master`)
6. Clique em "Deploy"

### 4. Configurar Buildpacks
No EasyPanel, configure:
- **Builder**: `heroku/builder:24`
- **Build Command**: `npm run build`
- **Start Command**: `node server/start-production.js`

### 5. Configurar Variáveis de Ambiente
No EasyPanel, adicione as variáveis:
- `NODE_ENV` = `production`
- `PORT` = `8080`
- `HOST` = `0.0.0.0`
- `DATABASE_URL` = sua URL do PostgreSQL
- `LOGIN` = seu email de admin
- `SENHA` = sua senha de admin
- `SESSION_SECRET` = sua chave secreta

## 🔧 Configuração Avançada

### Dockerfile
O projeto já inclui um `Dockerfile` otimizado que:
- Usa o construtor `heroku/builder:24`
- Instala dependências de produção
- Builda a aplicação
- Configura o ambiente de produção

### Health Check
A aplicação inclui endpoint de health check:
```
GET /api/health
```

### Volumes
- `uploads/` - Arquivos enviados pelos usuários
- `dist/` - Arquivos buildados automaticamente

## 📊 Monitoramento

### Logs
```bash
# No EasyPanel, vá para a aba "Logs"
# Ou use o terminal integrado
```

### Status
```bash
# Verifique o health check
curl -f http://localhost:8080/api/health
```

## 🚨 Troubleshooting

### Erro: Build falhou
- Verifique se o Node.js 18+ está disponível
- Confirme se todas as dependências estão no `package.json`
- Verifique os logs de build no EasyPanel

### Erro: Container não inicia
- Verifique as variáveis de ambiente
- Confirme se o banco de dados está acessível
- Verifique os logs de runtime

### Erro: Aplicação não responde
- Confirme se a porta 8080 está sendo exposta
- Verifique se o health check está funcionando
- Confirme se o banco de dados está conectando

## 📚 Comandos Úteis

```bash
# Verificar status do container
docker ps

# Ver logs
docker logs <container_id>

# Acessar o container
docker exec -it <container_id> /bin/bash

# Reiniciar
docker restart <container_id>
```

## 🌐 Acesso

Após o deploy:
- **Local**: http://localhost:8080
- **Rede**: http://[IP_DO_SERVIDOR]:8080

## ✅ Checklist de Deploy

- [ ] Repositório clonado no servidor
- [ ] Variáveis de ambiente configuradas
- [ ] Buildpacks configurados (`heroku/builder:24`)
- [ ] Deploy executado com sucesso
- [ ] Health check respondendo
- [ ] Aplicação acessível via navegador
- [ ] Banco de dados conectando
- [ ] Uploads funcionando

---

**Suporte**: Se encontrar problemas, verifique os logs no EasyPanel e consulte o `README_DEPLOY.md` completo.
