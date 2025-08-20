# 🚀 Deploy no Easypanel - Plano de Saúde Pet

Este guia explica como fazer o deploy da aplicação no Easypanel usando Buildpacks com o construtor `heroku/builder:24`.

## 📋 Pré-requisitos

- Conta no Easypanel
- Repositório Git com o código
- Banco de dados PostgreSQL configurado

## 🛠️ Configuração do Projeto

### 1. Arquivos de Configuração Criados

- `project.json` - Configuração principal do buildpack
- `Procfile` - Define como iniciar a aplicação
- `.buildpacks` - Especifica o buildpack do Node.js
- `build.sh` - Script de build personalizado
- `env.example` - Exemplo de variáveis de ambiente

### 2. Buildpack Configurado

O projeto está configurado para usar:
- **Construtor**: `heroku/builder:24`
- **Buildpack**: `heroku/nodejs`

## 🔧 Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Easypanel:

### Obrigatórias
```
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=seu_admin_username
SENHA=sua_admin_password
SESSION_SECRET=sua_chave_secreta_muito_forte
```

### Opcionais
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
GOOGLE_CLOUD_PROJECT_ID=seu_project_id
GOOGLE_CLOUD_STORAGE_BUCKET=seu_bucket_name
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

## 📦 Processo de Deploy

### No Easypanel:

1. **Criar Nova Aplicação**
   - Vá para o painel do Easypanel
   - Clique em "Create Application"
   - Escolha "Git Repository"

2. **Configurar Repositório**
   - Cole a URL do seu repositório Git
   - Selecione a branch principal (main/master)

3. **Configurar Build**
   - **Build Method**: Buildpacks
   - **Builder**: `heroku/builder:24`
   - **Buildpack**: Será detectado automaticamente como `heroku/nodejs`

4. **Configurar Variáveis de Ambiente**
   - Vá para a aba "Environment"
   - Adicione todas as variáveis listadas acima

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde o processo de build e deploy

## 🔄 Processo de Build Automático

O processo de build executará automaticamente:

1. `npm ci --include=dev` - Instala dependências
2. `npm run build` - Compila frontend (Vite) e backend (esbuild)
3. `npm start` - Inicia a aplicação em produção

## 📁 Estrutura após Build

```
dist/
├── index.js           # Servidor backend compilado
└── public/           # Frontend estático
    ├── index.html
    ├── assets/       # CSS/JS compilados
    └── images/       # Imagens estáticas
```

## 🗄️ Configuração do Banco de Dados

Após o primeiro deploy, execute as migrações:

1. Acesse o console da aplicação no Easypanel
2. Execute: `npm run db:push`

## 🔍 Verificação do Deploy

### URLs de Teste:
- `/` - Página inicial
- `/admin/login` - Painel administrativo
- `/api/health` - Health check (se implementado)

### Logs:
- Monitore os logs no painel do Easypanel
- Verifique se não há erros de conexão com o banco

## 🚨 Solução de Problemas

### Build Falha
- Verifique se todas as dependências estão no `package.json`
- Confirme que o Node.js >= 18.0.0 está sendo usado

### Aplicação não Inicia
- Verifique as variáveis de ambiente
- Confirme a conexão com o banco de dados
- Verifique os logs da aplicação

### Problemas de Assets
- Confirme que o `dist/public` foi gerado corretamente
- Verifique se as imagens estão no diretório correto

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs da aplicação
2. Confirme a configuração das variáveis de ambiente
3. Teste a aplicação localmente primeiro

---

✅ **O projeto está pronto para deploy no Easypanel!**
