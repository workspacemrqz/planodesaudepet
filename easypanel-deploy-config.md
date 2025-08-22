# Configuração de Deploy para EasyPanel

## Problemas Identificados e Soluções

### 1. Problema: Imagens não sendo carregadas
**Causa:** Configuração inadequada do servidor para servir arquivos estáticos
**Solução:** 
- Adicionadas rotas específicas para servir imagens (`/assets/*`)
- Melhorada configuração de headers de cache para imagens
- Adicionados logs detalhados para debug de imagens

### 2. Problema: Erro CSS na aba Rede
**Causa:** Sintaxe CSS incorreta com valores hexadecimais malformados
**Solução:**
- Corrigida sintaxe CSS incorreta em `NUCLEAR_OVERRIDE.css`
- Substituídas classes `text-[#302e2b]` por `text-gray-800`
- Substituídas classes `text-[#FBF9F7]` por `text-white`
- Adicionados estilos específicos para `.admin-rede-search`

### 3. Problema: Erro na aplicação do FAQ
**Causa:** Problemas de autenticação e tratamento de erro inadequado
**Solução:**
- Melhorados logs de autenticação para debug
- Adicionado tratamento de erro detalhado em todas as rotas do FAQ
- Corrigida configuração de sessão para produção
- Adicionadas notificações de sucesso e erro no frontend

### 4. Problema: Warning PostCSS
**Causa:** Configuração inadequada do PostCSS
**Solução:**
- Corrigida configuração do PostCSS com opções `from` e `to`
- Criada configuração específica para produção

### 5. Problema: Warning de Rate Limiting
**Causa:** Configuração inadequada do trust proxy
**Solução:**
- Trust proxy só é habilitado quando `TRUST_PROXY=true`
- Configuração condicional baseada no ambiente

## Configurações de Ambiente

### Variáveis Obrigatórias
```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
DATABASE_URL=your-production-database-url
LOGIN=your-admin-username
SENHA=your-admin-password
SESSION_SECRET=your-super-secret-session-key
```

### Variáveis Opcionais
```bash
TRUST_PROXY=false  # Só true se estiver atrás de reverse proxy
VITE_API_TIMEOUT=10000
VITE_MAX_FILE_SIZE=5242880
```

## Comandos de Deploy

### 1. Build de Produção
```bash
# Windows
scripts\build-production.bat

# Linux/Mac
./scripts/build-production.sh
```

### 2. Verificar Build
```bash
# Verificar se as imagens estão presentes
ls -la dist/public/assets/

# Verificar tamanho do build
du -sh dist/public/
```

### 3. Testar Localmente
```bash
npm run start:prod
```

## Estrutura de Arquivos Esperada

```
dist/
└── public/
    ├── index.html
    ├── assets/
    │   ├── *.js
    │   ├── *.css
    │   └── *.png, *.jpg, *.svg, etc.
    └── uploads/  # Se existir
```

## Logs de Debug

### Imagens
- `[IMAGE] Request for: /path/to/image`
- `[IMAGE] Full path: /full/system/path`
- `[IMAGE] Path exists: true/false`

### Autenticação
- `🔐 [AUTH] requireAdmin middleware called for: /path`
- `🔐 [AUTH] Session info: {...}`
- `✅ [AUTH] Admin authentication successful for user: username`

### FAQ
- `🔍 [ADMIN] Fetching all FAQ items...`
- `✅ [ADMIN] Found X FAQ items`
- `❌ [ADMIN] Error fetching FAQ items: error details`

## Troubleshooting

### Se as imagens não carregarem:
1. Verificar logs `[IMAGE]` no console
2. Verificar se a pasta `dist/public/assets` existe
3. Verificar permissões dos arquivos
4. Verificar se o build foi feito corretamente

### Se o FAQ não funcionar:
1. Verificar logs de autenticação
2. Verificar se o usuário está logado
3. Verificar logs das rotas do FAQ
4. Verificar configuração de sessão

### Se houver erros CSS:
1. Verificar se não há sintaxe incorreta com `#` em classes
2. Verificar se o Tailwind está configurado corretamente
3. Verificar se não há conflitos de CSS

## Monitoramento

### Endpoints de Diagnóstico
- `/health` - Status geral da aplicação
- `/api/diagnostic` - Informações detalhadas do sistema

### Métricas Importantes
- Tempo de resposta das APIs
- Taxa de erro das rotas
- Uso de memória do servidor
- Número de requisições de imagens
