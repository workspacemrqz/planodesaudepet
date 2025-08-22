-- Script de migração para criar as tabelas da área do cliente
-- Execute este script no seu banco de dados PostgreSQL

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf VARCHAR NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela de planos dos clientes
CREATE TABLE IF NOT EXISTS planos_clientes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id VARCHAR NOT NULL REFERENCES clientes(id),
  plano_id VARCHAR NOT NULL REFERENCES plans(id),
  numero_apolice VARCHAR NOT NULL UNIQUE,
  mensalidade INTEGER NOT NULL, -- em centavos
  vencimento INTEGER NOT NULL, -- dia do mês
  forma_pagamento TEXT NOT NULL,
  coparticipacao TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' NOT NULL, -- ativo, cancelado, suspenso
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela de benefícios dos planos
CREATE TABLE IF NOT EXISTS beneficios_planos (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id VARCHAR NOT NULL REFERENCES plans(id),
  tipo_beneficio TEXT NOT NULL, -- consultas, exames, cirurgias, emergencias
  carencia TEXT NOT NULL, -- em dias ou "imediato"
  descricao TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela de informações de contato
CREATE TABLE IF NOT EXISTS informacoes_contato (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento TEXT NOT NULL,
  app TEXT NOT NULL,
  site TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_planos_clientes_cliente_id ON planos_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_planos_clientes_plano_id ON planos_clientes(plano_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_planos_plano_id ON beneficios_planos(plano_id);

-- Comentários para documentação
COMMENT ON TABLE clientes IS 'Tabela para armazenar informações dos clientes';
COMMENT ON TABLE planos_clientes IS 'Tabela para armazenar os planos contratados pelos clientes';
COMMENT ON TABLE beneficios_planos IS 'Tabela para armazenar os benefícios e carências de cada plano';
COMMENT ON TABLE informacoes_contato IS 'Tabela para armazenar informações de contato da empresa';
