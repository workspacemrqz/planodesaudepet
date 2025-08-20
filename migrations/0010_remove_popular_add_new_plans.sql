-- Remove isPopular field and restructure plans
-- Step 1: Remove existing plans to avoid conflicts
DELETE FROM plans;

-- Step 2: Drop the isPopular column
ALTER TABLE plans DROP COLUMN IF EXISTS is_popular;

-- Step 3: Drop old pricing columns if they still exist
ALTER TABLE plans DROP COLUMN IF EXISTS price_normal;
ALTER TABLE plans DROP COLUMN IF EXISTS price_with_copay;

-- Step 4: Insert new plans according to specifications

-- Com carência e sem coparticipação (with_waiting_period)
INSERT INTO plans (id, name, price, description, features, plan_type, display_order, is_active) VALUES
(
  gen_random_uuid(),
  'BASIC',
  2000, -- R$ 20,00 in cents
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
  20000, -- R$ 200,00 in cents
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
);

-- Sem carência e com coparticipação (without_waiting_period)
INSERT INTO plans (id, name, price, description, features, plan_type, display_order, is_active) VALUES
(
  gen_random_uuid(),
  'COMFORT',
  5000, -- R$ 50,00 in cents
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
  10000, -- R$ 100,00 in cents
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
