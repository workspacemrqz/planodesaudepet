import { db } from '../db';
import { sql } from 'drizzle-orm';
import { plans } from '../../shared/schema';

export async function initializeDatabase() {
  try {
    console.log('🔧 Checking database schema and data...');
    
    // Check if plans table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      );
    `);
    
    if (!tableExists[0]?.exists) {
      console.log('❌ Plans table does not exist. Please run database migrations first.');
      return;
    }
    
    // Check current columns in plans table
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns in plans table:');
    columns.forEach((col: any) => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if we have old schema (price_normal, price_with_copay) or new schema (price)
    const hasOldPriceColumns = columns.some((col: any) => 
      col.column_name === 'price_normal' || col.column_name === 'price_with_copay'
    );
    const hasNewPriceColumn = columns.some((col: any) => col.column_name === 'price');
    const hasIsPopularColumn = columns.some((col: any) => col.column_name === 'is_popular');
    const hasPlanTypeColumn = columns.some((col: any) => col.column_name === 'plan_type');
    
    console.log('Schema analysis:');
    console.log('- Has old price columns (price_normal/price_with_copay):', hasOldPriceColumns);
    console.log('- Has new price column:', hasNewPriceColumn);
    console.log('- Has is_popular column:', hasIsPopularColumn);
    console.log('- Has plan_type column:', hasPlanTypeColumn);
    
    // If we don't have the price column, we need to migrate
    if (!hasNewPriceColumn) {
      console.log('🔧 Migrating database schema...');
      
      // Step 1: Add new columns if they don't exist
      console.log('Adding price column...');
      await db.execute(sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0 NOT NULL`);
      
      if (!hasPlanTypeColumn) {
        console.log('Adding plan_type enum and column...');
        // Create enum if it doesn't exist
        await db.execute(sql`
          DO $$ BEGIN
            CREATE TYPE plan_type_enum AS ENUM ('with_waiting_period', 'without_waiting_period');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        await db.execute(sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_type plan_type_enum DEFAULT 'with_waiting_period' NOT NULL`);
      }
      
      // Step 2: Migrate data from old columns to new columns if they exist
      if (hasOldPriceColumns) {
        console.log('Migrating price data from old columns...');
        await db.execute(sql`
          UPDATE plans 
          SET price = COALESCE(price_normal, price_with_copay, 0)
          WHERE price = 0 AND (price_normal IS NOT NULL OR price_with_copay IS NOT NULL)
        `);
      }
      
      // Step 3: Remove old columns if they exist
      if (hasOldPriceColumns) {
        console.log('Removing old columns...');
        if (hasIsPopularColumn) {
          await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS is_popular`);
        }
        await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS price_normal`);
        await db.execute(sql`ALTER TABLE plans DROP COLUMN IF EXISTS price_with_copay`);
      }
      
      console.log('✅ Schema migration completed!');
    }
    
    // Check if we have any plans data
    const plansCount = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const currentCount = parseInt(plansCount[0]?.count || '0');
    
    console.log(`Current plans count: ${currentCount}`);
    
    // If no plans exist, insert the default plans
    if (currentCount === 0) {
      console.log('No plans found. Inserting default plans...');
      
      const planData = [
        {
          name: 'BASIC',
          price: 2000, // R$ 20,00 in cents
          description: 'Plano essencial com carência e sem coparticipação',
          features: [
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
          planType: 'with_waiting_period',
          displayOrder: 1
        },
        {
          name: 'INFINITY',
          price: 20000, // R$ 200,00 in cents
          description: 'Plano completo com carência e sem coparticipação',
          features: [
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
          planType: 'with_waiting_period',
          displayOrder: 2
        },
        {
          name: 'COMFORT',
          price: 5000, // R$ 50,00 in cents
          description: 'Plano intermediário sem carência e com coparticipação',
          features: [
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
          planType: 'without_waiting_period',
          displayOrder: 3
        },
        {
          name: 'PLATINUM',
          price: 10000, // R$ 100,00 in cents
          description: 'Plano avançado sem carência e com coparticipação',
          features: [
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
          planType: 'without_waiting_period',
          displayOrder: 4
        }
      ];
      
      for (const plan of planData) {
        await db.execute(sql`
          INSERT INTO plans (name, price, description, features, plan_type, display_order, is_active, button_text, redirect_url)
          VALUES (${plan.name}, ${plan.price}, ${plan.description}, ${plan.features}, ${plan.planType}::plan_type_enum, ${plan.displayOrder}, true, 'Contratar Plano', '/contact')
        `);
      }
      
      console.log(`✅ Successfully inserted ${planData.length} plans!`);
    } else {
      console.log('✅ Plans data already exists');
    }
    
    // Verify the final result
    const finalPlans = await db.execute(sql`SELECT name, price, plan_type FROM plans WHERE is_active = true ORDER BY display_order`);
    console.log('Active plans in database:');
    finalPlans.forEach((plan: any) => {
      console.log(`- ${plan.name}: R$ ${(plan.price / 100).toFixed(2)} (${plan.plan_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// If this file is run directly (not imported), execute the initialization
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then(() => {
    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
}
