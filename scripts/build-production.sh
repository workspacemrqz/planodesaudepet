#!/bin/bash

# Script de build otimizado para produção
echo "🚀 Iniciando build de produção..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf dist/
rm -rf client/dist/

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build do cliente com configuração de produção
echo "🔨 Build do cliente..."
cd client
npm run build:prod
cd ..

# Verificar se o build foi bem-sucedido
if [ ! -d "dist/public" ]; then
    echo "❌ Erro: Build do cliente falhou"
    exit 1
fi

# Verificar se as imagens estão presentes
echo "🖼️ Verificando imagens..."
if [ -d "dist/public/assets" ]; then
    IMAGE_COUNT=$(find dist/public/assets -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" -o -name "*.ico" | wc -l)
    echo "✅ Encontradas $IMAGE_COUNT imagens no build"
else
    echo "⚠️ Pasta de assets não encontrada"
fi

# Verificar se os arquivos CSS estão presentes
echo "🎨 Verificando arquivos CSS..."
if [ -d "dist/public/assets" ]; then
    CSS_COUNT=$(find dist/public/assets -name "*.css" | wc -l)
    echo "✅ Encontrados $CSS_COUNT arquivos CSS no build"
else
    echo "⚠️ Arquivos CSS não encontrados"
fi

# Verificar se os arquivos JS estão presentes
echo "⚡ Verificando arquivos JavaScript..."
if [ -d "dist/public/assets" ]; then
    JS_COUNT=$(find dist/public/assets -name "*.js" | wc -l)
    echo "✅ Encontrados $JS_COUNT arquivos JavaScript no build"
else
    echo "⚠️ Arquivos JavaScript não encontrados"
fi

# Verificar se o index.html está presente
if [ -f "dist/public/index.html" ]; then
    echo "✅ index.html encontrado"
else
    echo "❌ index.html não encontrado"
    exit 1
fi

# Verificar tamanho do build
BUILD_SIZE=$(du -sh dist/public | cut -f1)
echo "📊 Tamanho total do build: $BUILD_SIZE"

# Verificar permissões
echo "🔐 Ajustando permissões..."
chmod -R 755 dist/
chmod -R 644 dist/public/assets/*

echo "✅ Build de produção concluído com sucesso!"
echo "📁 Build disponível em: dist/public/"
echo "🌐 Para testar localmente: npm run start:prod"
