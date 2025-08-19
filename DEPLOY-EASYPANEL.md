# Deploy no EasyPanel - Plano de Saúde Pet

## Configuração para Buildpacks

Este projeto está configurado para ser implantado no EasyPanel usando o método de construção **Buildpacks** com o construtor `heroku/builder:24`.

## Arquivos de Configuração

### 1. app.json
O arquivo `app.json` contém as configurações necessárias para o buildpack:
- **Buildpack**: `heroku/builder:24`
- **Stack**: `heroku-24`
- **Variáveis de ambiente** necessárias

### 2. Procfile
Define como iniciar a aplicação em produção:
```
web: npm start
```

### 3. .buildpacks
Especifica o construtor a ser usado:
```
heroku/builder:24
```

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no EasyPanel:

- `DATABASE_URL`: URL de conexão com PostgreSQL
- `LOGIN`: Email do administrador
- `SENHA`: Senha do administrador
- `PORT`: Porta da aplicação (padrão: 3000)
- `HOST`: Host da aplicação (padrão: 0.0.0.0)
- `NODE_ENV`: Ambiente (production)
- `SESSION_SECRET`: Chave secreta para sessões (será gerada automaticamente)

## Scripts de Build

O projeto possui os seguintes scripts configurados:
- `npm run build`: Compila o frontend e backend
- `npm start`: Inicia a aplicação em produção
- `heroku-postbuild`: Executado automaticamente após instalação das dependências
- `postinstall`: Backup do script de build

## Processo de Deploy

1. **No EasyPanel**:
   - Selecione "Deploy from Git"
   - Escolha o método de construção "Buildpacks"
   - Use o construtor `heroku/builder:24`
   - Configure as variáveis de ambiente listadas acima

2. **Configurações de Rede**:
   - A aplicação será executada na porta definida pela variável `PORT`
   - O host será `0.0.0.0` em produção

3. **Banco de Dados**:
   - Após o deploy, execute `npm run db:push` para aplicar as migrações
   - Ou configure o script `postdeploy` no app.json

## Estrutura do Projeto

- **Frontend**: React + Vite (pasta `client/`)
- **Backend**: Express + TypeScript (pasta `server/`)
- **Banco**: PostgreSQL com Drizzle ORM
- **Uploads**: Sistema de upload de arquivos (pasta `uploads/`)

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão listadas no `package.json`
- Confirme se o Node.js está na versão >= 18.0.0

### Erro de Conexão com Banco
- Verifique a `DATABASE_URL`
- Confirme se o banco PostgreSQL está acessível

### Erro de Porta
- A aplicação usa a variável `PORT` do ambiente
- Em produção, o host é automaticamente definido como `0.0.0.0`

## Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Aplicar migrações do banco
npm run db:push
```