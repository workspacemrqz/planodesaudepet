import "dotenv/config";
import { initializeDatabase } from "./initialize-database";

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  console.log('================================');
  
  try {
    // Run the full database initialization
    await initializeDatabase();
    
    console.log('================================');
    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('Your database is now ready with:');
    console.log('- ✅ All tables created with correct schema');
    console.log('- ✅ No automatic data insertion (clean deployment)');
    console.log('- ✅ Authentication via environment variables only');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Configure environment variables (ADMIN_USER, ADMIN_PASSWORD)');
    console.log('2. Access /admin to create plans and configure settings');
    console.log('3. Optional: Run "npm run seed:data" for sample data');
    console.log('');
    console.log('🎉 Ready for clean deployment!');
    
  } catch (error) {
    console.log('================================');
    console.error('❌ Database setup failed:', error);
    console.log('');
    console.log('Please check:');
    console.log('- DATABASE_URL is correctly set in your .env file');
    console.log('- Database server is running and accessible');
    console.log('- Database credentials are correct');
    
    process.exit(1);
  }
}

setupDatabase();
