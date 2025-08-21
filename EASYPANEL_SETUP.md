# 🚀 Configuração EasyPanel - Plano de Saúde Pet

## ✅ Configurações Aplicadas

### 1. **Arquivos de Configuração Otimizados**

#### `easypanel.json` - Configuração Principal
```json
{
  "build": {
    "type": "buildpacks",
    "builder": "heroku/builder:24",
    "buildCommand": "npm run build"
  },
  "env": {
    "NODE_ENV": "production",
    "NPM_CONFIG_PRODUCTION": "false",
    "PORT": "8080",
    "HOST": "0.0.0.0"
  },
  "healthCheck": {
    "path": "/api/diagnostic",
    "interval": 30,
    "timeout": 10,
    "retries": 3
  },
  "ports": [
    {
      "published": 80,
      "target": 8080
    }
  ]
}
```

#### `Procfile` - Comando de Inicialização
```
web: node server/start-production.js
```

#### `.npmrc` - Configurações NPM Otimizadas
```
audit=false
fund=false
legacy-peer-deps=true
prefer-offline=true
cache-min=86400
progress=false
loglevel=warn
```

### 2. **Scripts de Build Configurados**

#### `package.json` - Scripts Principais
- ✅ `build`: Compila frontend e backend
- ✅ `start`: Inicia servidor de produção
- ✅ `heroku-postbuild`: Hook para buildpacks
- ✅ `setup:db`: Inicializa banco de dados

#### Comando de Build Otimizado
```bash
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### 3. **Estrutura de Deploy**
```
projeto/
├── easypanel.json          # Configuração EasyPanel
├── Procfile               # Comando de inicialização
├── .npmrc                 # Configurações NPM
├── package.json           # Dependencies e scripts
├── app.json              # Configurações Heroku/Buildpacks
├── server/
│   ├── start-production.js # Script de produção robusto
│   └── index.ts           # Servidor principal
├── client/                # Frontend React
└── dist/                  # Build final
    ├── index.js          # Servidor compilado
    └── public/           # Assets estáticos
```

---

## 🛠️ Guia de Deploy no EasyPanel

### Passo 1: Preparar Repositório

```bash
# Commit todas as configurações
git add .
git commit -m "Configure project for EasyPanel deployment with heroku/builder:24"
git push origin main
```

### Passo 2: Criar App no EasyPanel

1. **Novo Projeto**
   - Clique em "Create New App"
   - Escolha "GitHub" como fonte
   - Selecione seu repositório

2. **Configuração de Build**
   - **Build Method**: `Buildpacks`
   - **Builder**: `heroku/builder:24`
   - **Build Command**: Deixe vazio (usa heroku-postbuild automaticamente)
   - **Start Command**: `node server/start-production.js`

### Passo 3: Configurar Variáveis de Ambiente

#### ⚠️ Variáveis Obrigatórias
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
ADMIN_USER=admin@seudominio.com
ADMIN_PASSWORD=senha-super-segura-123
SESSION_SECRET=chave-secreta-minimo-32-caracteres
```

#### 🔧 Variáveis Opcionais
```env
# Google Cloud Storage (para uploads em produção)
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
GOOGLE_CLOUD_STORAGE_BUCKET=seu-bucket

# Configurações de servidor
PORT=8080
HOST=0.0.0.0
```

### Passo 4: Configurar Banco de Dados

#### Opção A: Banco Integrado do EasyPanel
1. Adicione serviço PostgreSQL no EasyPanel
2. Use a `DATABASE_URL` fornecida pelo EasyPanel

#### Opção B: Banco Externo (Recomendado)
```bash
# Neon (Gratuito)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require

# Supabase (Gratuito)  
DATABASE_URL=postgresql://user:pass@db.xxx.supabase.co:5432/postgres

# Railway
DATABASE_URL=postgresql://user:pass@containers-us-west-xxx.railway.app:5432/railway
```

### Passo 5: Deploy e Verificação

1. **Iniciar Deploy**
   ```
   Clique em "Deploy" no EasyPanel
   ```

2. **Monitorar Logs**
   Procure por estas mensagens de sucesso:
   ```
   ✅ Build completed successfully
   ✅ Server started on port 8080
   ✅ Database initialization completed
   ✅ serving on http://0.0.0.0:8080
   ```

3. **Verificar Funcionalidade**
   ```bash
   # Teste o health check
   curl https://seuapp.easypanel.host/api/diagnostic
   
   # Teste a aplicação
   curl https://seuapp.easypanel.host/
   ```

---

## 🔍 Troubleshooting

### ❌ Erro: "Build failed"

**Causa**: Dependências ou scripts de build
```bash
# Verificar localmente
npm install
npm run build
npm run start
```

**Solução**: Verificar logs de build no EasyPanel

### ❌ Erro: "Application crashed"

**Causa**: Variáveis de ambiente ausentes
```bash
# Verificar se estão definidas:
- DATABASE_URL
- ADMIN_USER  
- ADMIN_PASSWORD
- SESSION_SECRET
```

### ❌ Erro: "Database connection failed"

**Causa**: URL do banco incorreta ou banco inacessível
```bash
# Testar conexão localmente
psql "postgresql://user:pass@host:port/db"
```

### ❌ Erro: "404 - Assets not found"

**Causa**: Build não gerou arquivos estáticos
```bash
# Verificar estrutura após build
ls -la dist/public/assets/
```

**Solução**: Verificar se `npm run build` executou corretamente

---

## 🚀 Funcionalidades Após Deploy

### ✅ Frontend Público
- **Home**: Apresentação do plano de saúde
- **Planos**: Visualização dos planos disponíveis  
- **Rede**: Unidades credenciadas
- **FAQ**: Perguntas frequentes
- **Contato**: Formulário de contato

### ✅ Painel Administrativo (`/admin`)
- **Login**: Autenticação segura com rate limiting
- **Dashboard**: 5 abas de gerenciamento
  - **Formulários**: Visualizar submissões
  - **Planos**: Editar preços e características
  - **Rede**: Gerenciar unidades credenciadas  
  - **FAQ**: Adicionar/editar perguntas
  - **Configurações**: Upload de imagens, textos

### ✅ API Endpoints
- `/api/plans` - Listar planos públicos
- `/api/contact` - Enviar formulário de contato
- `/api/network-units` - Listar rede credenciada
- `/api/faq` - Perguntas frequentes
- `/api/admin/*` - Endpoints administrativos (protegidos)

---

## 🔐 Segurança Implementada

### ✅ Autenticação
- Login com rate limiting (5 tentativas/15min)
- Bloqueio temporário após falhas consecutivas
- Sessões seguras com cookies HttpOnly
- Logout automático após inatividade

### ✅ Proteção de Rotas
- Middleware de autenticação em todas as rotas admin
- Validação de entrada com Zod
- Sanitização de dados
- Headers de segurança configurados

### ✅ Banco de Dados
- Queries parametrizadas (Drizzle ORM)
- Validação de schema
- Backup automático (se configurado)
- SSL em produção

---

## 📊 Monitoramento

### Health Check Configurado
- **Endpoint**: `/api/diagnostic`
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos  
- **Retries**: 3 tentativas

### Logs Importantes
```bash
# Sucesso
✅ Database initialization completed
✅ Server started successfully
✅ All static files served correctly

# Atenção
⚠️ High memory usage detected
⚠️ Database connection slow
⚠️ Rate limit triggered for IP

# Erro
❌ Database connection failed
❌ Static files not found
❌ Authentication service down
```

---

## 🎯 Próximos Passos

### Após Deploy Bem-sucedido

1. **Configurar Domínio Personalizado**
   ```
   Configure DNS para apontar para EasyPanel
   ```

2. **Configurar SSL/TLS**
   ```
   EasyPanel configura automaticamente Let's Encrypt
   ```

3. **Popular Dados Iniciais**
   ```bash
   # Via painel admin ou API
   curl -X POST https://seuapp.com/api/admin/plans
   ```

4. **Configurar Backups**
   ```
   Configure backup automático do PostgreSQL
   ```

5. **Monitoramento**
   ```
   Configure alertas para uptime e performance
   ```

---

## 📞 Suporte

### Comandos de Diagnóstico
```bash
# Status da aplicação
curl https://seuapp.com/api/diagnostic

# Testar autenticação
curl -X POST https://seuapp.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@email.com","password":"senha"}'

# Verificar planos
curl https://seuapp.com/api/plans
```

### Informações do Deploy
- **Builder**: heroku/builder:24
- **Runtime**: Node.js 18+
- **Framework**: Express.js + React
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Autenticação**: Express Session

---

*Configuração otimizada para EasyPanel - Janeiro 2025*
