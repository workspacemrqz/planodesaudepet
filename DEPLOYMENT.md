# 🚀 Guia de Implantação no EasyPanel

## 📋 Pré-requisitos

- Conta no EasyPanel
- Banco de dados PostgreSQL configurado
- Repositório Git com o código

## 🔧 Configuração no EasyPanel

### 1. Criar Nova Aplicação

1. Acesse seu painel EasyPanel
2. Clique em "Create Service" > "App"
3. Escolha "Git Repository" como source
4. Configure o repositório do projeto

### 2. Configurar Build

- **Build Type**: `Buildpack`
- **Buildpack**: `heroku/nodejs` ou `heroku/builder:24`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 3. Variáveis de Ambiente Obrigatórias

Configure as seguintes variáveis no EasyPanel:

```env
NODE_ENV=production
PORT=80
HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@host:port/database
LOGIN=seu_email_admin@exemplo.com
SENHA=sua_senha_super_segura
SESSION_SECRET=chave_secreta_sessao_muito_longa_e_segura
```

### 4. Configurações de Deploy

- **Port**: `80`
- **Memory**: `512MB` (mínimo)
- **CPU**: `0.25` cores (mínimo)
- **Replicas**: `1`

## 🗄️ Configuração do Banco de Dados

### Criar Banco PostgreSQL

1. No EasyPanel, crie um serviço PostgreSQL
2. Anote as credenciais: host, port, database, user, password
3. Monte a `DATABASE_URL` no formato:
   ```
   postgresql://usuario:senha@host:porta/nome_database
   ```

### Aplicar Migrações

Após o primeiro deploy, conecte-se ao container e execute:

```bash
# Aplicar schema do banco
npm run db:push

# Aplicar migração dos planos
npm run migrate:plans
```

Ou configure no EasyPanel para executar automaticamente no post-deploy.

## 🔐 Configurações de Segurança

### SESSION_SECRET
Gere uma chave segura:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Credenciais Admin
- **LOGIN**: Email válido para acesso ao painel admin
- **SENHA**: Senha forte (mínimo 8 caracteres)

## 📁 Estrutura de Deploy

O build gera os seguintes arquivos:

```
dist/
├── index.js           # Servidor Node.js compilado
└── public/            # Frontend compilado
    ├── index.html
    ├── assets/        # JS/CSS compilados
    └── uploads/       # Diretório para uploads
```

## 🚀 Processo de Deploy

1. **Push para repositório**:
   ```bash
   git add .
   git commit -m "Deploy para EasyPanel"
   git push origin main
   ```

2. **EasyPanel automático**:
   - Detecta mudanças no Git
   - Executa build automático
   - Deploy da nova versão

3. **Verificação**:
   - Acesse a URL do app
   - Teste a página inicial
   - Acesse `/admin` para o painel
   - Verifique `/planos` com as abas

## 🛠️ Comandos Úteis

### Durante desenvolvimento:
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run check        # Verificação de tipos
```

### Em produção:
```bash
npm start            # Iniciar servidor
npm run db:push      # Aplicar schema
npm run migrate:plans # Migrar planos
```

## 🐛 Troubleshooting

### Build falha
- Verifique se todas as dependências estão em `dependencies`
- Confirme que o Node.js é versão 18+

### Database erro
- Verifique se `DATABASE_URL` está correta
- Confirme conectividade com o PostgreSQL
- Execute `npm run db:push` manualmente

### Aplicação não inicia
- Verifique se `PORT=80` está configurado
- Confirme se `HOST=0.0.0.0`
- Verifique logs do container

### Admin não funciona
- Confirme `LOGIN` e `SENHA` nas variáveis
- Verifique se `SESSION_SECRET` está configurado
- Teste acesso em `/admin`

## 📊 Monitoramento

### Logs
Acesse logs do container no EasyPanel para debug.

### Health Check
A aplicação responde em `/` para verificações de saúde.

### Métricas
- CPU/Memory usage no dashboard EasyPanel
- Tempo de resposta das requisições
- Status do banco de dados

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça alterações no código
2. Commit e push para Git
3. EasyPanel fará deploy automático
4. Se houver mudanças no banco, execute migrações manualmente

## 📞 Suporte

Em caso de problemas:
1. Verifique logs do container
2. Confirme variáveis de ambiente
3. Teste conectividade do banco
4. Verifique status dos serviços no EasyPanel
