# Instruções de Deploy no Easypanel

## Configuração Atual

O projeto está configurado para deploy no Easypanel usando Buildpacks com o construtor `heroku/builder:24`.

## Arquivos de Configuração

### 1. easypanel.json
- Configuração principal do Easypanel
- Método: Buildpacks
- Builder: heroku/builder:24
- Buildpack: heroku/nodejs

### 2. .buildpacks
- Lista os buildpacks necessários
- heroku/nodejs para Node.js

### 3. Procfile
- Define o comando de inicialização: `web: npm start`

### 4. package.json
- Scripts de build configurados
- `build:easypanel`: Build específico para Easypanel

## Passos para Deploy

### 1. Preparar o Repositório
```bash
# Fazer commit das alterações
git add .
git commit -m "Configuração para deploy no Easypanel"
git push origin main
```

### 2. Configurar no Easypanel
1. Acessar o painel do Easypanel
2. Criar nova aplicação
3. Conectar com o repositório GitHub
4. Configurar as variáveis de ambiente necessárias

### 3. Variáveis de Ambiente Necessárias
```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=sua_url_do_banco
# Outras variáveis específicas do seu projeto
```

### 4. Deploy
- O Easypanel detectará automaticamente a configuração
- Usará o script `build:easypanel` para build
- Usará o comando `npm start` para inicialização

## Verificações Pós-Deploy

### 1. Health Check
- Endpoint: `/api/health`
- Deve retornar status 200

### 2. Logs
- Verificar logs de inicialização
- Verificar se não há erros de compilação

### 3. Funcionalidades
- Testar rotas principais
- Verificar conexão com banco de dados

## Troubleshooting

### Erros de Build
- Verificar se o TypeScript compila: `npm run build:server`
- Verificar se o cliente builda: `npm run build:client`

### Erros de Runtime
- Verificar logs do Easypanel
- Verificar variáveis de ambiente
- Verificar conectividade com banco de dados

## Notas Importantes

- As funções problemáticas foram comentadas temporariamente para permitir o deploy
- Após o deploy funcionar, essas funções devem ser corrigidas e reativadas
- O projeto usa TypeScript, certifique-se de que todas as dependências estão instaladas

## Comandos Úteis

```bash
# Build local para teste
npm run build:easypanel

# Verificar TypeScript
npm run check

# Build do servidor
npm run build:server

# Build do cliente
npm run build:client
```
