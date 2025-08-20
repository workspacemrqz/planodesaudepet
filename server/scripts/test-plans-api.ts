import "dotenv/config";
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function testPlansAPI() {
  try {
    console.log('🧪 Testing Plans API...');
    console.log('================================');
    
    // Test database connection
    console.log('1. Testing database connection...');
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful:', connectionTest);
    
    // Check if plans table exists
    console.log('2. Checking if plans table exists...');
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      ) as exists
    `);
    const exists = tableExists[0]?.exists || tableExists.rows?.[0]?.exists;
    console.log('✅ Plans table exists:', exists);
    
    if (!exists) {
      console.log('❌ Plans table does not exist! Run database initialization first.');
      return;
    }
    
    // Check table structure
    console.log('3. Checking table structure...');
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'plans' 
      ORDER BY ordinal_position
    `);
    
    console.log('Table columns:');
    const columnRows = columns.rows || columns;
    if (Array.isArray(columnRows)) {
      columnRows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('Could not parse columns result');
    }
    
    // Count all plans
    console.log('4. Counting all plans...');
    const totalPlans = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const totalCount = totalPlans[0]?.count || totalPlans.rows?.[0]?.count;
    console.log('✅ Total plans in database:', totalCount);
    
    // Count active plans
    console.log('5. Counting active plans...');
    const activePlans = await db.execute(sql`SELECT COUNT(*) as count FROM plans WHERE is_active = true`);
    const activeCount = activePlans[0]?.count || activePlans.rows?.[0]?.count;
    console.log('✅ Active plans in database:', activeCount);
    
    // List all plans
    console.log('6. Listing all plans...');
    const allPlans = await db.execute(sql`
      SELECT id, name, price, is_active, plan_type, display_order 
      FROM plans 
      ORDER BY display_order
    `);
    
    console.log('All plans:');
    const planRows = allPlans.rows || allPlans;
    if (Array.isArray(planRows)) {
      planRows.forEach((plan: any, index: number) => {
        const status = plan.is_active ? '✅ Active' : '❌ Inactive';
        const price = `R$ ${(plan.price / 100).toFixed(2)}`;
        console.log(`  ${index + 1}. ${plan.name} - ${price} - ${plan.plan_type} - ${status}`);
      });
    } else {
      console.log('Could not parse plans result');
    }
    
    // Test API simulation (what the frontend would get)
    console.log('7. Simulating API call for active plans...');
    const apiPlans = await db.execute(sql`
      SELECT * FROM plans 
      WHERE is_active = true 
      ORDER BY display_order
    `);
    
    const apiPlanRows = apiPlans.rows || apiPlans;
    const apiPlansLength = Array.isArray(apiPlanRows) ? apiPlanRows.length : 0;
    console.log(`✅ API would return ${apiPlansLength} active plans:`);
    
    if (Array.isArray(apiPlanRows)) {
      apiPlanRows.forEach((plan: any, index: number) => {
        console.log(`  ${index + 1}. ${plan.name} - R$ ${(plan.price / 100).toFixed(2)}`);
      });
    } else {
      console.log('Could not parse API plans result');
    }
    
    console.log('================================');
    console.log('🎉 Plans API test completed successfully!');
    
    if (apiPlansLength === 0) {
      console.log('⚠️  WARNING: No active plans found! This would cause the frontend error.');
      console.log('   Make sure to run the database initialization script.');
    }
    
  } catch (error) {
    console.log('================================');
    console.error('❌ Plans API test failed:', error);
    console.log('');
    console.log('This error would cause the frontend to show:');
    console.log('"Erro ao carregar planos. Tente novamente."');
  }
}

testPlansAPI().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
