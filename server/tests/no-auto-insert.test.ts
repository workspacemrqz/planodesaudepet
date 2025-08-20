import { describe, it, expect, beforeEach } from 'vitest';
import { initializeDatabase } from '../scripts/initialize-database';
import { db } from '../db';
import { sql } from 'drizzle-orm';

describe('No Automatic Data Insertion', () => {
  beforeEach(async () => {
    // Clean database before each test
    await db.execute(sql`DELETE FROM plans`);
    await db.execute(sql`DELETE FROM site_settings`);
  });

  it('should not insert plans automatically during initialization', async () => {
    // Run database initialization
    await initializeDatabase();
    
    // Check that no plans were inserted
    const plansCount = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const count = plansCount[0]?.count || plansCount.rows?.[0]?.count;
    
    expect(parseInt(count.toString())).toBe(0);
  });

  it('should not insert site settings automatically during initialization', async () => {
    // Run database initialization
    await initializeDatabase();
    
    // Check that no site settings were inserted
    const settingsCount = await db.execute(sql`SELECT COUNT(*) as count FROM site_settings`);
    const count = settingsCount[0]?.count || settingsCount.rows?.[0]?.count;
    
    expect(parseInt(count.toString())).toBe(0);
  });

  it('should create tables but leave them empty', async () => {
    // Run database initialization
    await initializeDatabase();
    
    // Verify tables exist
    const tablesCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('plans', 'site_settings', 'contact_submissions', 'network_units', 'faq_items')
    `);
    
    const tables = tablesCheck.rows || tablesCheck;
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    
    // But verify they are empty
    const plansCount = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const settingsCount = await db.execute(sql`SELECT COUNT(*) as count FROM site_settings`);
    
    const plansTotal = parseInt((plansCount[0]?.count || plansCount.rows?.[0]?.count || '0').toString());
    const settingsTotal = parseInt((settingsCount[0]?.count || settingsCount.rows?.[0]?.count || '0').toString());
    
    expect(plansTotal).toBe(0);
    expect(settingsTotal).toBe(0);
  });

  it('should be idempotent - running multiple times should not create data', async () => {
    // Run initialization multiple times
    await initializeDatabase();
    await initializeDatabase();
    await initializeDatabase();
    
    // Verify still no data was created
    const plansCount = await db.execute(sql`SELECT COUNT(*) as count FROM plans`);
    const settingsCount = await db.execute(sql`SELECT COUNT(*) as count FROM site_settings`);
    
    const plansTotal = parseInt((plansCount[0]?.count || plansCount.rows?.[0]?.count || '0').toString());
    const settingsTotal = parseInt((settingsCount[0]?.count || settingsCount.rows?.[0]?.count || '0').toString());
    
    expect(plansTotal).toBe(0);
    expect(settingsTotal).toBe(0);
  });
});
