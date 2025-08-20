import "dotenv/config";
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Optional script to seed initial data for development/testing
 * This script is NOT run automatically during deployment
 * Run manually with: npm run seed:data
 */
async function seedInitialData() {
  try {
    console.log('🌱 Seeding initial data (optional)...');
    console.log('⚠️  This script should only be run manually for development/testing');
    
    // Check current state
    const plansCount = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const currentCount = parseInt(plansCount[0]?.count || plansCount.rows?.[0]?.count || '0');
    
    console.log(`Current plans count: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('⚠️  Plans already exist. Skipping plan insertion.');
      console.log('   Use the admin panel to manage plans instead.');
    } else {
      console.log('📝 Inserting sample plans for development...');
      
      const planData = [
        {
          name: 'BASIC',
          price: 2000,
          description: 'Plano essencial com carência e sem coparticipação',
          features: ['Consulta Clínica Geral', 'Retorno Clínico', 'Vacina de Raiva', 'Vacinas V7 / V8 / V10 / V3 / V4'],
          planType: 'with_waiting_period',
          displayOrder: 1
        },
        {
          name: 'INFINITY',
          price: 20000,
          description: 'Plano completo com carência e sem coparticipação',
          features: ['Consulta Clínica Geral', 'Retorno Clínico', 'Atestado de Saúde', 'Consultas especializadas*'],
          planType: 'with_waiting_period',
          displayOrder: 2
        },
        {
          name: 'COMFORT',
          price: 5000,
          description: 'Plano intermediário sem carência e com coparticipação',
          features: ['Consulta Clínica Geral', 'Retorno Clínico', 'Vacina de Raiva', 'Ultrassonografia'],
          planType: 'without_waiting_period',
          displayOrder: 3
        },
        {
          name: 'PLATINUM',
          price: 10000,
          description: 'Plano avançado sem carência e com coparticipação',
          features: ['Consulta Clínica Geral', 'Retorno Clínico', 'Atestado de Saúde', 'Consultas especializadas*'],
          planType: 'without_waiting_period',
          displayOrder: 4
        }
      ];
      
      for (const plan of planData) {
        await db.execute(sql`
          INSERT INTO plans (name, price, description, features, plan_type, display_order, is_active, button_text, redirect_url)
          VALUES (${plan.name}, ${plan.price}, ${plan.description}, ARRAY[${sql.join(plan.features.map(f => sql`${f}`), sql`, `)}], ${plan.planType}::plan_type_enum, ${plan.displayOrder}, true, 'Contratar Plano', '/contact')
          ON CONFLICT (name) DO NOTHING
        `);
      }
      
      console.log(`✅ Inserted ${planData.length} sample plans`);
    }
    
    // Check site settings
    const settingsCount = await db.execute(sql`SELECT COUNT(*) as count FROM site_settings`);
    const currentSettingsCount = parseInt(settingsCount[0]?.count || settingsCount.rows?.[0]?.count || '0');
    
    if (currentSettingsCount > 0) {
      console.log('⚠️  Site settings already exist. Skipping settings insertion.');
    } else {
      console.log('📝 Inserting sample site settings for development...');
      
      await db.execute(sql`
        INSERT INTO site_settings (
          whatsapp, email, phone, cnpj, address, our_story
        ) VALUES (
          '5511999999999',
          'contato@unipetplan.com.br',
          '(11) 9999-9999',
          '12.345.678/0001-90',
          'São Paulo, SP',
          'Somos especialistas em cuidados veterinários e oferecemos os melhores planos de saúde para pets.'
        )
      `);
      
      console.log('✅ Sample site settings inserted');
    }
    
    console.log('\n📋 Summary:');
    const finalPlansCount = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const finalSettingsCount = await db.execute(sql`SELECT COUNT(*) as count FROM site_settings`);
    
    const plansTotal = finalPlansCount[0]?.count || finalPlansCount.rows?.[0]?.count;
    const settingsTotal = finalSettingsCount[0]?.count || finalSettingsCount.rows?.[0]?.count;
    
    console.log(`- Plans: ${plansTotal}`);
    console.log(`- Site settings: ${settingsTotal}`);
    console.log('\n💡 Tip: Use the admin panel at /admin to manage all data');
    
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    throw error;
  }
}

// Export for use in other scripts
export { seedInitialData };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedInitialData().then(() => {
    console.log('\n🎉 Initial data seeding completed!');
    console.log('   Remember: This should only be used for development/testing');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
}
