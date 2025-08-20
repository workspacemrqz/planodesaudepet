# ✅ Checklist de Deploy - Easypanel

## Pré-Deploy

- [ ] Código commitado e pushado para o repositório
- [ ] Banco de dados PostgreSQL criado e acessível
- [ ] Variáveis de ambiente preparadas
- [ ] Build local testado com sucesso (`npm run build`)

## Configuração no Easypanel

- [ ] Aplicação criada no Easypanel
- [ ] Repositório Git conectado
- [ ] Branch principal selecionada
- [ ] Método de build: **Buildpacks**
- [ ] Builder: **heroku/builder:24**

## Variáveis de Ambiente

### Obrigatórias ⚠️
- [ ] `DATABASE_URL` - URL do PostgreSQL
- [ ] `LOGIN` - Username do admin
- [ ] `SENHA` - Senha do admin
- [ ] `SESSION_SECRET` - Chave secreta para sessões

### Opcionais
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `HOST=0.0.0.0`
- [ ] `GOOGLE_CLOUD_PROJECT_ID` (se usar Google Cloud Storage)
- [ ] `GOOGLE_CLOUD_STORAGE_BUCKET` (se usar Google Cloud Storage)

## Pós-Deploy

- [ ] Deploy executado com sucesso
- [ ] Logs verificados (sem erros críticos)
- [ ] Aplicação acessível na URL fornecida
- [ ] Migração do banco executada (`npm run db:push`)

## Testes de Funcionalidade

### Frontend
- [ ] Página inicial carrega corretamente
- [ ] Navegação entre páginas funciona
- [ ] Design responsivo funcionando
- [ ] Imagens carregando corretamente

### Admin
- [ ] Login admin funcionando (`/admin/login`)
- [ ] Dashboard admin acessível
- [ ] Formulários de cadastro funcionando
- [ ] Upload de imagens funcionando

### API
- [ ] Endpoints da API respondendo
- [ ] Autenticação funcionando
- [ ] Conexão com banco de dados estável

## Problemas Comuns e Soluções

### Build Falha
- Verificar se todas as dependências estão no `package.json`
- Confirmar versão do Node.js (>=18.0.0)
- Verificar logs de build para erros específicos

### Aplicação não Inicia
- Verificar variáveis de ambiente
- Confirmar conexão com banco de dados
- Verificar porta configurada corretamente

### Erro 500 na Aplicação
- Verificar logs da aplicação
- Confirmar variáveis de ambiente estão corretas
- Verificar se as migrações foram executadas

### Assets não Carregam
- Verificar se o build gerou a pasta `dist/public`
- Confirmar que as imagens estão no local correto
- Verificar configuração de servir arquivos estáticos

---

## 🆘 Em Caso de Problemas

1. **Verificar Logs**: Primeiro, sempre verificar os logs da aplicação no Easypanel
2. **Testar Local**: Reproduzir o problema localmente com `npm run build && npm start`
3. **Verificar Variáveis**: Confirmar que todas as variáveis de ambiente estão configuradas
4. **Backup**: Se necessário, fazer rollback para versão anterior funcionando

---

✅ **Projeto pronto para deploy no Easypanel com heroku/builder:24!**
