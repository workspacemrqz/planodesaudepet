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
    console.log('- ✅ 4 plans inserted (BASIC, INFINITY, COMFORT, PLATINUM)');
    console.log('- ✅ Site settings configured');
    console.log('- ✅ Admin user ready (check your .env file)');
    console.log('');
    console.log('🎉 You can now deploy without database setup issues!');
    
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
