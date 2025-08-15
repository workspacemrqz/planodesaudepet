# Deployment no EasyPanel

Este projeto está configurado para deployment no EasyPanel utilizando Buildpacks com o construtor `heroku/builder:24`.

## Arquivos de Configuração

### Procfile
Especifica o comando para iniciar a aplicação:
```
web: npm start
```

### app.json
Contém a configuração do buildpack e variáveis de ambiente necessárias:
- Buildpack: `heroku/builder:24`
- Variáveis de ambiente: `NODE_ENV`, `DATABASE_URL`, `LOGIN`, `SENHA`
- Script pós-deploy: `npm run db:push`

### .buildpacks
Arquivo alternativo para especificar o buildpack:
```
heroku/builder:24
```

## Configurações Realizadas

1. **Servidor configurado** para aceitar conexões em `0.0.0.0` em produção
2. **Porta dinâmica** configurada via variável de ambiente `PORT`
3. **Script heroku-postbuild** adicionado ao package.json
4. **Variáveis de ambiente** documentadas no app.json

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no EasyPanel:
- `NODE_ENV=production`
- `DATABASE_URL` - URL do banco PostgreSQL
- `LOGIN` - Login do administrador
- `SENHA` - Senha do administrador
- `PORT` - Porta da aplicação (configurada automaticamente pelo EasyPanel)

## Processo de Build

1. O buildpack `heroku/builder:24` detecta automaticamente o projeto Node.js
2. Executa `npm install` para instalar dependências
3. Executa `npm run heroku-postbuild` que roda o build da aplicação
4. Após o deploy, executa `npm run db:push` para sincronizar o banco
5. Inicia a aplicação com `npm start`

## Deploy

Para fazer o deploy no EasyPanel:
1. Crie um novo serviço
2. Selecione "Build from Source"
3. Configure o repositório Git
4. Selecione "Buildpacks" como método de build
5. Configure as variáveis de ambiente necessárias
6. Faça o deploy