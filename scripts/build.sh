#!/bin/bash

# Script de build para produção
# Uso: ./scripts/build.sh

set -e

echo "🚀 Iniciando build de produção..."

# Verificar se estamos no diretório raiz
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf dist/
rm -rf client/dist/

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Build do cliente
echo "🔨 Build do cliente (React)..."
npm run build:client

# Build do servidor
echo "🔨 Build do servidor (TypeScript)..."
npm run build:server

# Verificar estrutura
echo "✅ Verificando estrutura de build..."
if [ -d "dist/client" ] && [ -d "dist/server" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Estrutura gerada:"
    ls -la dist/
    echo ""
    echo "📊 Tamanho dos diretórios:"
    du -sh dist/client
    du -sh dist/server
else
    echo "❌ Erro: Build incompleto"
    exit 1
fi

echo "🎉 Build concluído! A aplicação está pronta para deploy."
