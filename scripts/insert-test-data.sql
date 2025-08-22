-- Script para inserir dados de teste para a área do cliente
-- Execute este script após criar as tabelas

-- Inserir cliente de teste
INSERT INTO clientes (id, nome, cpf, email, telefone, created_at, updated_at) 
VALUES (
  'cliente-test-001',
  'Maria Silva Santos',
  '123.456.789-01',
  'maria.santos@email.com',
  '(11) 98765-4321',
  NOW(),
  NOW()
);

-- Inserir plano INFINITY (se não existir)
INSERT INTO plans (id, name, price, description, features, button_text, redirect_url, plan_type, is_active, display_order, created_at)
VALUES (
  'plano-infinity-001',
  'INFINITY',
  20000, -- R$ 200,00 em centavos
  'Plano completo com cobertura máxima para seu pet',
  ARRAY['Consultas ilimitadas', 'Exames laboratoriais', 'Cirurgias', 'Emergências 24h', 'Vacinas', 'Medicamentos'],
  'Contratar Plano',
  '/contact',
  'without_waiting_period',
  true,
  1,
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Inserir plano do cliente
INSERT INTO planos_clientes (id, cliente_id, plano_id, numero_apolice, mensalidade, vencimento, forma_pagamento, coparticipacao, status, data_inicio, created_at, updated_at)
VALUES (
  'plano-cliente-001',
  'cliente-test-001',
  'plano-infinity-001',
  'PC-2025-789456',
  20000, -- R$ 200,00 em centavos
  15, -- dia 15
  'Débito automático',
  'Sem coparticipação',
  'ativo',
  '2025-01-01',
  NOW(),
  NOW()
);

-- Inserir benefícios do plano
INSERT INTO beneficios_planos (id, plano_id, tipo_beneficio, carencia, descricao, created_at, updated_at) VALUES
('beneficio-001', 'plano-infinity-001', 'consultas', '30', 'Consultas com carência de 30 dias', NOW(), NOW()),
('beneficio-002', 'plano-infinity-001', 'exames', '60', 'Exames com carência de 60 dias', NOW(), NOW()),
('beneficio-003', 'plano-infinity-001', 'cirurgias', '180', 'Cirurgias com carência de 180 dias', NOW(), NOW()),
('beneficio-004', 'plano-infinity-001', 'emergencias', 'imediato', 'Emergências com cobertura imediata', NOW(), NOW());

-- Inserir informações de contato
INSERT INTO informacoes_contato (id, atendimento, app, site, created_at, updated_at)
VALUES (
  'contato-001',
  '0800-123-4567',
  'UNIPET PLAN',
  'www.unipetplan.com.br',
  NOW(),
  NOW()
);
