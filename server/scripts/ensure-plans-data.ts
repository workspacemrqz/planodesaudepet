import { db } from '../db';
import { plans } from '@shared/schema';
import { eq, count } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function ensurePlansData() {
  try {
    console.log('Checking database connection...');
    
    // Check if plans table exists and count records
    const plansCount = await db.select({ count: count() }).from(plans);
    console.log('Current plans count:', plansCount[0]?.count || 0);
    
    // If no plans exist, insert the four required plans
    if (plansCount[0]?.count === 0) {
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
          planType: 'with_waiting_period' as const,
          displayOrder: 1,
          isActive: true
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
          planType: 'with_waiting_period' as const,
          displayOrder: 2,
          isActive: true
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
          planType: 'without_waiting_period' as const,
          displayOrder: 3,
          isActive: true
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
          planType: 'without_waiting_period' as const,
          displayOrder: 4,
          isActive: true
        }
      ];
      
      await db.insert(plans).values(planData);
      console.log('Successfully inserted', planData.length, 'plans');
    } else {
      console.log('Plans already exist, checking data...');
      
      // Fetch and display current plans
      const currentPlans = await db.select().from(plans);
      console.log('Current plans:');
      currentPlans.forEach(plan => {
        console.log(`- ${plan.name}: R$ ${(plan.price / 100).toFixed(2)} (${plan.planType})`);
      });
    }
    
    console.log('Plans data verification completed successfully');
  } catch (error) {
    console.error('Error ensuring plans data:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the function
ensurePlansData().then(() => {
  console.log('Script completed');
  process.exit(0);
});
