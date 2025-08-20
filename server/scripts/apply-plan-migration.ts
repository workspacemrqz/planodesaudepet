import { db } from "../db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

async function applyPlanMigration() {
  try {
    console.log("Aplicando migração dos planos...");
    
    // Remover planos existentes
    console.log("1. Removendo planos existentes...");
    await db.execute(sql`DELETE FROM plans;`);
    
    // Remover coluna isPopular se existir
    console.log("2. Removendo coluna is_popular...");
    try {
      await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS is_popular;`);
    } catch (error) {
      console.log("Coluna is_popular não existe ou já foi removida");
    }
    
    // Remover colunas de preço antigas se existirem
    console.log("3. Removendo colunas de preço antigas...");
    try {
      await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS price_normal;`);
      await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS price_with_copay;`);
    } catch (error) {
      console.log("Colunas de preço antigas não existem ou já foram removidas");
    }
    
    // Inserir novos planos
    console.log("4. Inserindo novos planos...");
    
    // Com carência e sem coparticipação
    await db.execute(sql`
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
      );
    `);
    
    // Sem carência e com coparticipação
    await db.execute(sql`
      INSERT INTO plans (id, name, price, description, features, plan_type, display_order, is_active) VALUES
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
    `);
    
    console.log("✅ Migração aplicada com sucesso!");
    console.log("✅ 4 novos planos inseridos:");
    console.log("  - BASIC (R$ 20/mês) - Com carência");
    console.log("  - INFINITY (R$ 200/mês) - Com carência");
    console.log("  - COMFORT (R$ 50/mês) - Sem carência");
    console.log("  - PLATINUM (R$ 100/mês) - Sem carência");
    
  } catch (error) {
    console.error("❌ Erro ao aplicar migração:", error);
  } finally {
    process.exit(0);
  }
}

applyPlanMigration();
