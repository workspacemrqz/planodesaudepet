#!/bin/bash

# 🚀 EasyPanel Deploy Script - UNIPET PLAN
# Otimizado para Buildpacks Heroku

set -e

echo "🏥 UNIPET PLAN - Deploy no EasyPanel"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar Node.js
log_info "Verificando versão do Node.js..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_success "Node.js: $NODE_VERSION, npm: $NPM_VERSION"

# Verificar variáveis de ambiente
log_info "Verificando variáveis de ambiente..."
REQUIRED_VARS=("DATABASE_URL" "LOGIN" "SENHA" "SESSION_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_warning "Variáveis de ambiente não configuradas: ${MISSING_VARS[*]}"
    log_info "Configure-as no EasyPanel antes do deploy"
else
    log_success "Todas as variáveis de ambiente estão configuradas"
fi

# Limpar builds anteriores
log_info "Limpando builds anteriores..."
npm run clean

# Verificar TypeScript
log_info "Verificando tipos TypeScript..."
if npm run check; then
    log_success "Verificação de tipos concluída"
else
    log_warning "Problemas de tipos detectados, tentando build com configuração permissiva..."
    if npm run check:strict; then
        log_success "Verificação estrita concluída"
    else
        log_error "Problemas críticos de tipos detectados"
        log_info "Execute 'npm run check' para ver detalhes"
        exit 1
    fi
fi

# Build da aplicação
log_info "Iniciando build da aplicação..."
if npm run build; then
    log_success "Build concluído com sucesso"
else
    log_warning "Build principal falhou, tentando fallback..."
    if npm run build:fallback; then
        log_success "Build fallback concluído"
    else
        log_error "Build falhou completamente"
        exit 1
    fi
fi

# Verificar arquivos de build
log_info "Verificando arquivos de build..."
if [ -f "dist/index.js" ] && [ -d "dist/public" ]; then
    log_success "Arquivos de build verificados"
else
    log_error "Arquivos de build não encontrados"
    exit 1
fi

# Health check
log_info "Executando health check..."
if npm run health:check; then
    log_success "Health check concluído"
else
    log_warning "Health check falhou, mas continuando..."
fi

# Preparar para deploy
log_info "Preparando para deploy no EasyPanel..."

# Criar arquivo .env.example se não existir
if [ ! -f ".env.example" ]; then
    cat > .env.example << EOF
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgresql://username:password@host:port/database
LOGIN=admin@example.com
SENHA=your_secure_password_here_min_12_chars
SESSION_SECRET=your_session_secret_here_min_32_chars
EOF
    log_success "Arquivo .env.example criado"
fi

# Verificar Procfile
if [ -f "Procfile" ]; then
    log_success "Procfile encontrado"
else
    log_error "Procfile não encontrado"
    exit 1
fi

# Verificar Dockerfile
if [ -f "Dockerfile" ]; then
    log_success "Dockerfile encontrado"
else
    log_error "Dockerfile não encontrado"
    exit 1
fi

echo ""
echo "🎉 Deploy preparado com sucesso!"
echo ""
echo "📋 Próximos passos no EasyPanel:"
echo "1. Acesse o painel do EasyPanel"
echo "2. Crie um novo projeto ou selecione existente"
echo "3. Configure as variáveis de ambiente:"
echo "   - DATABASE_URL: $([ -n "$DATABASE_URL" ] && echo "✅ Configurado" || echo "❌ Não configurado")"
echo "   - LOGIN: $([ -n "$LOGIN" ] && echo "✅ Configurado" || echo "❌ Não configurado")"
echo "   - SENHA: $([ -n "$SENHA" ] && echo "✅ Configurado" || echo "❌ Não configurado")"
echo "   - SESSION_SECRET: $([ -n "$SESSION_SECRET" ] && echo "✅ Configurado" || echo "❌ Não configurado")"
echo "4. Configure o build command: npm run build"
echo "5. Configure o start command: node server/start-production.js"
echo "6. Execute o deploy"
echo ""
echo "🔧 Configurações recomendadas:"
echo "- Builder: heroku/builder:24"
echo "- Porta: 8080"
echo "- Health check: /api/health"
echo ""
echo "📚 Documentação: easypanel-deploy.md"
echo "🚨 Troubleshooting: npm run health:check"
