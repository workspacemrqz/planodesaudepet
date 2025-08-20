# 🚨 Troubleshooting - Tela Azul no Deploy

## ✅ Soluções Aplicadas

### 1. **Configuração do Servidor de Assets Estáticos**
- ✅ Melhorou a função `serveStatic()` com tratamento de erros
- ✅ Adicionou logs de debug para verificar arquivos
- ✅ Configurou headers corretos para cache

### 2. **Configuração do Vite**
- ✅ Adicionou `assetsDir: 'assets'` 
- ✅ Configurou `manualChunks` para otimização
- ✅ Melhorou estrutura de output

### 3. **Endpoint de Health Check**
- ✅ Adicionado `/health` para verificar status do servidor

## 🔧 Como Verificar o Deploy

### 1. **Acesse o Health Check**
```
https://seu-dominio.easypanel.host/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "publicPath": "/app/dist/public",
  "filesExist": true,
  "indexExists": true
}
```

### 2. **Verifique os Logs**
No painel do Easypanel, procure por:
- `Attempting to serve static files from: /app/dist/public`
- `Files in public directory: [array de arquivos]`

### 3. **Teste URLs Diretas**
- `https://seu-dominio/assets/index-[hash].css` - Deve carregar o CSS
- `https://seu-dominio/assets/index-[hash].js` - Deve carregar o JS

## 🚨 Se Ainda Não Funcionar

### Opção 1: Verificar Build
```bash
# No console do Easypanel
ls -la /app/dist/public/
ls -la /app/dist/public/assets/
```

### Opção 2: Verificar Permissões
```bash
# No console do Easypanel
chmod -R 755 /app/dist/public/
```

### Opção 3: Limpar Cache do Browser
- Force refresh: `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)
- Ou abra em aba anônima

### Opção 4: Verificar Variáveis de Ambiente
Certifique-se que estas variáveis estão configuradas:
```
NODE_ENV=production
PORT=80 (ou 3000)
DATABASE_URL=postgresql://...
LOGIN=seu_usuario
SENHA=sua_senha
SESSION_SECRET=sua_chave_secreta
```

## 📋 Checklist Final

- [ ] `/health` retorna status ok
- [ ] Logs mostram arquivos encontrados
- [ ] CSS e JS carregam em URLs diretas
- [ ] Variáveis de ambiente configuradas
- [ ] Cache do browser limpo
- [ ] Testado em aba anônima

## 🆘 Último Recurso

Se nada funcionar, execute no console do Easypanel:
```bash
cd /app
npm run build
npm start
```

E monitore os logs em tempo real para identificar o erro específico.
