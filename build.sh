#!/bin/bash

# Build script para Easypanel/Heroku Buildpack

echo "🏗️  Iniciando processo de build..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --include=dev

# Compilar o frontend (Vite)
echo "🎨 Compilando frontend..."
npm run build

# Verificar se o build do frontend foi criado
if [ ! -d "dist" ]; then
  echo "❌ Erro: Diretório dist não foi criado"
  exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos compilados estão em ./dist"

# Listar arquivos gerados
echo "📋 Arquivos gerados:"
ls -la dist/
