# 🚀 Deploy no EasyPanel - Plano de Saúde Pet

Este documento contém instruções para fazer o deploy da aplicação no EasyPanel usando Buildpacks com o construtor `heroku/builder:24`.

## 📋 Pré-requisitos

- EasyPanel configurado e funcionando
- Docker instalado no servidor
- Acesso ao banco de dados PostgreSQL
- Variáveis de ambiente configuradas

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no EasyPanel:

```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=admin@example.com
SENHA=your_secure_password_here_min_12_chars
SESSION_SECRET=your_session_secret_here_min_32_chars
```

### 2. Estrutura de Arquivos

O projeto já está configurado com os seguintes arquivos:

- `Dockerfile` - Configuração do container Docker
- `docker-compose.yml` - Orquestração dos serviços
- `easypanel.yml` - Configuração específica para EasyPanel
- `.buildpacks` - Configuração do construtor Heroku
- `deploy.sh` - Script de deploy automatizado

## 🚀 Deploy

### Opção 1: Deploy via EasyPanel UI

1. Acesse o painel do EasyPanel
2. Crie um novo projeto
3. Selecione "Deploy from Git" ou "Deploy from Dockerfile"
4. Configure as variáveis de ambiente
5. Deploy!

### Opção 2: Deploy via Script

```bash
# Torne o script executável
chmod +x deploy.sh

# Configure as variáveis de ambiente
export DATABASE_URL="postgresql://username:password@host:port/database"
export LOGIN="admin@example.com"
export SENHA="your_secure_password_here_min_12_chars"
export SESSION_SECRET="your_session_secret_here_min_32_chars"

# Execute o deploy
./deploy.sh
```

### Opção 3: Deploy via Docker Compose

```bash
# Configure as variáveis de ambiente
export DATABASE_URL="postgresql://username:password@host:port/database"
export LOGIN="admin@example.com"
export SENHA="your_secure_password_here_min_12_chars"
export SESSION_SECRET="your_session_secret_here_min_32_chars"

# Deploy
docker-compose up -d
```

## 🔍 Verificação

### Health Check

A aplicação inclui um endpoint de health check:

```bash
curl -f http://localhost:8080/api/health
```

### Logs

```bash
# Via Docker
docker logs planodesaudepet

# Via Docker Compose
docker-compose logs -f app
```

## 📁 Volumes

A aplicação usa os seguintes volumes:

- `uploads/` - Arquivos enviados pelos usuários
- `dist/` - Arquivos buildados (gerados automaticamente)

## 🔧 Troubleshooting

### Problema: Container não inicia

```bash
# Verifique os logs
docker logs planodesaudepet

# Verifique se as variáveis de ambiente estão corretas
docker exec planodesaudepet env | grep -E "(DATABASE_URL|LOGIN|SENHA|SESSION_SECRET)"
```

### Problema: Aplicação não responde

```bash
# Verifique se o container está rodando
docker ps

# Teste o health check
curl -v http://localhost:8080/api/health

# Verifique se a porta está sendo exposta
netstat -tlnp | grep 8080
```

### Problema: Erro de build

```bash
# Limpe o cache do Docker
docker system prune -a

# Rebuild a imagem
docker build --no-cache -t planodesaudepet:latest .
```

## 📚 Comandos Úteis

```bash
# Parar a aplicação
docker stop planodesaudepet

# Iniciar a aplicação
docker start planodesaudepet

# Reiniciar a aplicação
docker restart planodesaudepet

# Remover a aplicação
docker rm -f planodesaudepet

# Ver estatísticas
docker stats planodesaudepet
```

## 🌐 Acesso

Após o deploy bem-sucedido, a aplicação estará disponível em:

- **Local**: http://localhost:8080
- **Rede**: http://[IP_DO_SERVIDOR]:8080

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs da aplicação
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Verifique se o banco de dados está acessível
4. Consulte a documentação do EasyPanel

---

**Nota**: Este projeto está configurado para usar o construtor `heroku/builder:24` conforme solicitado, garantindo compatibilidade e estabilidade no EasyPanel.
