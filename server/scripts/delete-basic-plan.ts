import "dotenv/config";
import { db, pool } from "../db";
import { plans } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("Checking for 'Básico' plan records...");
    const basicPlans = await db.select().from(plans).where(eq(plans.name, "Básico"));

    if (basicPlans.length === 0) {
      console.log("No 'Básico' plan found. Nothing to delete.");
    } else {
      console.log(`Found ${basicPlans.length} record(s) for 'Básico'. Proceeding to permanent delete...`);
      const result = await db.delete(plans).where(eq(plans.name, "Básico"));
      console.log("Permanent delete executed.");
    }
  } catch (err) {
    console.error("Error during deletion:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();