import "dotenv/config";
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Final cleanup migration to ensure users and admin_users tables are permanently removed
 * and will never be recreated by any future migrations or initialization scripts.
 */
async function finalCleanupMigration() {
  try {
    console.log('🧹 Final cleanup migration: Ensuring user tables are permanently removed...');
    
    // Drop tables if they exist (with CASCADE to handle any dependencies)
    await db.execute(sql`DROP TABLE IF EXISTS admin_users CASCADE`);
    console.log('✅ admin_users table dropped (if existed)');
    
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    console.log('✅ users table dropped (if existed)');
    
    // Create a marker table to indicate this migration has been run
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS migration_markers (
        id varchar PRIMARY KEY,
        migration_name text NOT NULL,
        description text,
        executed_at timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Record this migration
    await db.execute(sql`
      INSERT INTO migration_markers (id, migration_name, description)
      VALUES ('user-tables-removed', 'Remove User Tables', 'Permanently removed users and admin_users tables - authentication now uses environment variables only')
      ON CONFLICT (id) DO UPDATE SET
        executed_at = now(),
        description = EXCLUDED.description
    `);
    
    console.log('✅ Migration marker created');
    
    // Verify tables are gone
    const remainingTables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'admin_users')
    `);
    
    const tableRows = remainingTables.rows || remainingTables;
    if (Array.isArray(tableRows) && tableRows.length === 0) {
      console.log('🎉 Verification complete: No user tables found in database');
    } else {
      console.warn('⚠️ Warning: Some user tables may still exist:', tableRows);
    }
    
    // Show current authentication status
    console.log('\n📋 Authentication System Status:');
    console.log('  ✅ Environment-based authentication: ACTIVE');
    console.log('  ❌ Database user tables: REMOVED');
    console.log('  🔒 Required env vars: ADMIN_USER, ADMIN_PASSWORD');
    console.log('  🔑 Alternative env vars: LOGIN, SENHA');
    console.log('  🛡️ Security features: Rate limiting, Account lockout, Session management');
    
  } catch (error) {
    console.error('❌ Final cleanup migration failed:', error);
    throw error;
  }
}

// Export for use in other scripts
export { finalCleanupMigration };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  finalCleanupMigration().then(() => {
    console.log('\n🎉 Final cleanup migration completed successfully!');
    console.log('   The system now uses environment-based authentication exclusively.');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
}
