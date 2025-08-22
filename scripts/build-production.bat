@echo off
REM Script de build otimizado para produção (Windows)
echo 🚀 Iniciando build de produção...

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script na raiz do projeto
    pause
    exit /b 1
)

REM Limpar builds anteriores
echo 🧹 Limpando builds anteriores...
if exist "dist" rmdir /s /q "dist"
if exist "client\dist" rmdir /s /q "client\dist"

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

REM Build do cliente com configuração de produção
echo 🔨 Build do cliente...
cd client
call npm run build:prod
cd ..

REM Verificar se o build foi bem-sucedido
if not exist "dist\public" (
    echo ❌ Erro: Build do cliente falhou
    pause
    exit /b 1
)

REM Verificar se as imagens estão presentes
echo 🖼️ Verificando imagens...
if exist "dist\public\assets" (
    echo ✅ Pasta de assets encontrada
) else (
    echo ⚠️ Pasta de assets não encontrada
)

REM Verificar se o index.html está presente
if exist "dist\public\index.html" (
    echo ✅ index.html encontrado
) else (
    echo ❌ index.html não encontrado
    pause
    exit /b 1
)

echo ✅ Build de produção concluído com sucesso!
echo 📁 Build disponível em: dist\public\
echo 🌐 Para testar localmente: npm run start:prod
pause
