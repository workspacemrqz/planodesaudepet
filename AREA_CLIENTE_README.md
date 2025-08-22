# Área do Cliente - UNIPET PLAN

## Visão Geral

A Área do Cliente é uma funcionalidade que permite aos clientes da UNIPET PLAN acessarem suas informações pessoais, detalhes do plano contratado, carências e informações de contato através de um login com email e CPF.

## Funcionalidades

### 🔐 Sistema de Login
- Autenticação via email e CPF
- Validação de credenciais
- Sessão persistente durante a navegação

### 📋 Informações Exibidas
- **Dados Pessoais**: Nome, CPF, telefone, email
- **Plano**: Nome do plano, número da apólice, mensalidade, vencimento
- **Carências**: Consultas, exames, cirurgias, emergências
- **Contato**: Atendimento, app, site

### 🎨 Interface
- Design responsivo seguindo o padrão visual do site
- Cards organizados por categoria
- Cores consistentes com a identidade visual da UNIPET PLAN
- Ícones intuitivos para melhor experiência do usuário

## Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `clientes`
- Armazena informações pessoais dos clientes
- Campos: id, nome, cpf, email, telefone, timestamps

#### 2. `planos_clientes`
- Relaciona clientes com seus planos contratados
- Campos: id, cliente_id, plano_id, número_apólice, mensalidade, vencimento, etc.

#### 3. `beneficios_planos`
- Define carências e benefícios de cada tipo de plano
- Campos: id, plano_id, tipo_beneficio, carência, descrição

#### 4. `informacoes_contato`
- Informações de contato da empresa
- Campos: id, atendimento, app, site

## Configuração

### 1. Executar Migrações
```sql
-- Execute o script de migração
\i scripts/migrate-db.sql
```

### 2. Inserir Dados de Teste
```sql
-- Execute o script de dados de teste
\i scripts/insert-test-data.sql
```

### 3. Verificar Rotas
A página está disponível em `/area-cliente` e já foi adicionada ao header de navegação.

## Dados de Teste

Para testar a funcionalidade, use as seguintes credenciais:

- **Email**: maria.santos@email.com
- **CPF**: 123.456.789-01

### Informações do Cliente de Teste
- **Nome**: Maria Silva Santos
- **Plano**: INFINITY
- **Mensalidade**: R$ 200,00
- **Vencimento**: Dia 15 de cada mês
- **Carências**:
  - Consultas: 30 dias
  - Exames: 60 dias
  - Cirurgias: 180 dias
  - Emergências: Cobertura imediata

## Arquivos Criados/Modificados

### Novos Arquivos
- `client/src/pages/area-cliente.tsx` - Página principal da área do cliente
- `scripts/migrate-db.sql` - Script de migração do banco
- `scripts/insert-test-data.sql` - Dados de teste
- `AREA_CLIENTE_README.md` - Este arquivo de documentação

### Arquivos Modificados
- `shared/schema.ts` - Adicionadas novas tabelas e tipos
- `client/src/components/layout/header.tsx` - Adicionado link "Área do Cliente"
- `client/src/App.tsx` - Adicionada nova rota

## Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Componentes UI**: Shadcn/ui
- **Ícones**: Lucide React
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Roteamento**: Wouter

## Próximos Passos

### Funcionalidades Futuras
1. **API Real**: Substituir dados mockados por chamadas reais à API
2. **Autenticação Segura**: Implementar JWT ou sessões seguras
3. **Recuperação de Senha**: Sistema de recuperação via email
4. **Histórico**: Histórico de consultas e procedimentos
5. **Downloads**: Download de documentos e faturas
6. **Notificações**: Sistema de notificações push

### Melhorias Técnicas
1. **Validação**: Validação de CPF e email no frontend
2. **Máscaras**: Máscaras para CPF e telefone
3. **Loading States**: Estados de carregamento mais sofisticados
4. **Error Handling**: Tratamento de erros mais robusto
5. **Tests**: Testes unitários e de integração

## Suporte

Para dúvidas ou problemas relacionados à Área do Cliente, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

---

**UNIPET PLAN** - Cuidando do seu pet com amor e responsabilidade 🐾
