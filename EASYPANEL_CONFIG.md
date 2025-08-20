# 🚀 Configuração Completa para EasyPanel

## ✅ Arquivos Configurados

### 📋 Configuração Principal
- ✅ `app.json` - Configuração Heroku/EasyPanel
- ✅ `package.json` - Scripts e dependências otimizadas
- ✅ `Procfile` - Comandos de execução
- ✅ `.buildpacks` - Buildpack Node.js
- ✅ `.easypanel.yml` - Configuração específica EasyPanel
- ✅ `heroku.yml` - Configuração alternativa Heroku
- ✅ `Dockerfile` - Container Docker (backup)

### 🔧 Otimizações
- ✅ Dependências de build movidas para `dependencies`
- ✅ Scripts de migração configurados
- ✅ Porta e host configurados automaticamente
- ✅ Variáveis de ambiente padronizadas
- ✅ `.npmrc` para builds otimizados

### 📁 Estrutura
- ✅ `uploads/` diretório criado e preservado
- ✅ Scripts de migração prontos
- ✅ Documentação completa

## 🛠️ Configuração no EasyPanel

### 1. Criar Aplicação
1. **Nome**: `plano-de-saude-pet`
2. **Tipo**: `App from Git Repository`
3. **Buildpack**: `heroku/nodejs`

### 2. Configurações de Build
```
Build Command: npm run build
Start Command: npm start
Port: 80
```

### 3. Variáveis de Ambiente
```env
NODE_ENV=production
PORT=80
HOST=0.0.0.0
DATABASE_URL=postgresql://user:pass@host:port/db
LOGIN=admin@exemplo.com
SENHA=senha_segura_admin
SESSION_SECRET=chave_secreta_muito_longa_e_segura
```

### 4. Recursos Recomendados
```
Memory: 512MB
CPU: 0.25 cores
Replicas: 1
```

## 🗄️ Configuração do Banco

### PostgreSQL no EasyPanel
1. Criar serviço PostgreSQL
2. Anotar credenciais
3. Montar DATABASE_URL

### Migrações Automáticas
As migrações serão executadas automaticamente:
- `npm run db:push` - Aplica schema
- `npm run migrate:plans` - Insere os 4 planos

## 🔐 Segurança

### Gerar SESSION_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Credenciais Seguras
- LOGIN: Email válido
- SENHA: Mínimo 8 caracteres, incluindo números e símbolos

## 🚀 Deploy

### Primeiro Deploy
1. Push código para Git
2. Configurar variáveis no EasyPanel
3. Deploy automático
4. Verificar migrações nos logs

### Atualizações
1. Git push
2. Deploy automático
3. Zero downtime

## ✅ Verificação Pós-Deploy

### Endpoints para Testar
- ✅ `GET /` - Página inicial
- ✅ `GET /planos` - Página de planos com abas
- ✅ `GET /admin` - Painel administrativo
- ✅ `GET /api/plans` - API dos planos

### Funcionalidades
- ✅ 4 planos nas abas corretas
- ✅ Painel admin funcionando
- ✅ Upload de imagens
- ✅ Responsividade mobile

## 🐛 Troubleshooting

### Build Falha
- Verificar Node.js versão 18+
- Confirmar dependências em `dependencies`

### App Não Inicia
- Verificar PORT=80
- Confirmar HOST=0.0.0.0
- Checar logs do container

### Database Error
- Verificar DATABASE_URL
- Confirmar conectividade PostgreSQL
- Executar migrações manualmente se necessário

### Admin Não Funciona
- Verificar LOGIN/SENHA
- Confirmar SESSION_SECRET
- Testar em `/admin`

## 📊 Monitoramento

### Logs Importantes
```
✅ Build concluído com sucesso!
✅ Migração aplicada com sucesso!
✅ serving on http://0.0.0.0:80
✅ Admin credentials validated
```

### Health Check
- Path: `/`
- Timeout: 30s
- Interval: 30s

## 🎯 Resultado Final

Após deploy bem-sucedido:

1. **Homepage** funcionando
2. **Página /planos** com 4 planos em abas:
   - Com carência: BASIC (R$20) e INFINITY (R$200)
   - Sem carência: COMFORT (R$50) e PLATINUM (R$100)
3. **Painel admin** em `/admin`
4. **Upload de imagens** funcionando
5. **Responsivo** em todos os dispositivos

## 🔄 Comandos Úteis

```bash
# Local
npm run dev           # Desenvolvimento
npm run build         # Build produção
npm run migrate:plans # Migrar planos

# Produção (EasyPanel)
npm start            # Servidor
npm run db:push      # Schema
npm run migrate:plans # Dados
```

---

🎉 **Projeto pronto para deploy no EasyPanel!**
