# Unipet Plan - Plataforma de Planos de Saúde Pet

## Descrição
Plataforma web para gestão e contratação de planos de saúde para pets, desenvolvida com Node.js, Express, React e TypeScript.

## Tecnologias
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Build**: Vite, TypeScript Compiler

## Pré-requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL

## Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/planodesaudepet.git
cd planodesaudepet
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o projeto:
```bash
npm run dev
```

## Build

Para gerar os arquivos de produção:
```bash
npm run build:simple
```

## Implantação no Easypanel

### Configuração Automática
O projeto já está configurado para funcionar com o Easypanel usando Buildpacks.

### Configurações do Easypanel
- **Método de Construção**: Buildpacks
- **Builder**: `heroku/builder:24`
- **Buildpack**: `heroku/nodejs`
- **Porta**: 8080
- **Comando de Build**: `npm run build:simple`
- **Comando de Inicialização**: `npm start`

### Variáveis de Ambiente Necessárias
```env
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
LOGIN=email@exemplo.com
SENHA=senha_admin
SESSION_SECRET=chave_secreta_para_sessao
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
```

### Passos para Implantação
1. Faça push do código para o GitHub
2. No Easypanel, crie um novo projeto
3. Conecte com o repositório GitHub
4. Configure as variáveis de ambiente
5. Deploy automático será executado

### Health Check
A aplicação expõe um endpoint de health check em `/api/health` para monitoramento.

## Estrutura do Projeto
```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Schemas e tipos compartilhados
├── dist/            # Arquivos compilados
├── scripts/         # Scripts de build
└── configs/         # Arquivos de configuração
```

## Scripts Disponíveis
- `npm run dev` - Desenvolvimento local
- `npm run build:simple` - Build para produção
- `npm run build:server` - Build apenas do servidor
- `npm run build:client:simple` - Build apenas do cliente
- `npm start` - Inicialização em produção

## Suporte
Para suporte técnico, entre em contato através do email configurado nas variáveis de ambiente.
