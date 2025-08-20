# Migração dos Planos - Instruções

## Problema Identificado

A migração dos planos ainda não foi aplicada no banco de dados. O sistema ainda está retornando os planos antigos com a estrutura anterior (`isPopular`, `priceNormal`, `priceWithCopay`), causando erros no frontend que agora espera a nova estrutura.

## Como Aplicar a Migração

### Opção 1: Executar Script de Migração (Recomendado)

1. **Configure o arquivo .env** com a `DATABASE_URL`:
   ```bash
   DATABASE_URL=sua_url_do_banco_aqui
   ```

2. **Execute o script de migração**:
   ```bash
   npm run migrate:plans
   ```

### Opção 2: Executar Manualmente no Banco

Conecte-se ao seu banco PostgreSQL e execute:

```sql
-- Remover planos existentes
DELETE FROM plans;

-- Remover coluna is_popular se existir
ALTER TABLE plans DROP COLUMN IF EXISTS is_popular;

-- Remover colunas de preço antigas se existirem
ALTER TABLE plans DROP COLUMN IF EXISTS price_normal;
ALTER TABLE plans DROP COLUMN IF EXISTS price_with_copay;

-- Inserir novos planos
INSERT INTO plans (id, name, price, description, features, plan_type, display_order, is_active) VALUES
(
  gen_random_uuid(),
  'BASIC',
  2000,
  'Plano essencial com carência e sem coparticipação',
  ARRAY[
    'Consulta Clínica Geral',
    'Retorno Clínico',
    'Vacina de Raiva',
    'Vacinas V7 / V8 / V10 / V3 / V4',
    'Exames laboratoriais 1*',
    'Coleta de exame de sangue',
    'Aplicação IM, SC, IV',
    'Anestesia 1*',
    'Internação 1*'
  ],
  'with_waiting_period',
  1,
  true
),
(
  gen_random_uuid(),
  'INFINITY',
  20000,
  'Plano completo com carência e sem coparticipação',
  ARRAY[
    'Consulta Clínica Geral',
    'Retorno Clínico',
    'Atestado de Saúde',
    'Consultas especializadas*',
    'Consulta Plantão',
    'Vacinas*',
    'Exames laboratoriais 1, 2, 3*',
    'Ultrassonografia',
    'Ultrassonografia Guiada',
    'Exames de imagem 1, 2, 3, 4*',
    'Anestesia 1, 2, 3*',
    'Internação 1, 2, 3*',
    'Cirurgias Eletivas',
    'Cirurgias Simples e Complexas'
  ],
  'with_waiting_period',
  2,
  true
),
(
  gen_random_uuid(),
  'COMFORT',
  5000,
  'Plano intermediário sem carência e com coparticipação',
  ARRAY[
    'Consulta Clínica Geral',
    'Retorno Clínico',
    'Vacina de Raiva',
    'Vacinas V7 / V8 / V10 / V3 / V4',
    'Exames laboratoriais 1*',
    'Coleta de exames de sangue',
    'Aplicação IM, SC, IV',
    'Ultrassonografia',
    'Ultrassonografia Guiada',
    'Cistocentese guiada*',
    'Anestesia 1*',
    'Internação 1*'
  ],
  'without_waiting_period',
  3,
  true
),
(
  gen_random_uuid(),
  'PLATINUM',
  10000,
  'Plano avançado sem carência e com coparticipação',
  ARRAY[
    'Consulta Clínica Geral',
    'Retorno Clínico',
    'Atestado de Saúde',
    'Consultas especializadas*',
    'Consulta Plantão',
    'Vacinas V7 / V8 / V10 / V3 / V4 / Gripe',
    'Exames laboratoriais 1, 2*',
    'Ultrassonografia',
    'Ultrassonografia Guiada',
    'Exames de imagem 3*',
    'Anestesia 1, 2*',
    'Internação 1, 2*',
    'Cirurgias Eletivas*'
  ],
  'without_waiting_period',
  4,
  true
);
```

## Resultado Esperado

Após aplicar a migração, você deverá ter 4 planos:

### Com carência e sem coparticipação:
- **BASIC** - R$ 20/mês
- **INFINITY** - R$ 200/mês

### Sem carência e com coparticipação:
- **COMFORT** - R$ 50/mês
- **PLATINUM** - R$ 100/mês

## Verificação

Após aplicar a migração:

1. Acesse a página `/planos` 
2. Verifique se as abas funcionam corretamente
3. Confirme se os 4 planos aparecem nas abas corretas
4. Teste o painel administrativo em `/admin`

## Limpeza

Após confirmar que tudo funciona, pode deletar:
- `server/scripts/apply-plan-migration.ts`
- `migrations/0010_remove_popular_add_new_plans.sql` 
- Este arquivo `MIGRATE_PLANS.md`
