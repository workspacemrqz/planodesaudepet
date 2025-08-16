import "dotenv/config";
import { db, pool } from "../db";
import { plans } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("Fetching 'Padrão' plan to clean up features...");
    const padraoPlans = await db.select().from(plans).where(eq(plans.name, "Padrão"));

    if (padraoPlans.length === 0) {
      console.log("No 'Padrão' plan found. Nothing to update.");
      return;
    }

    for (const plan of padraoPlans) {
      const original = plan.features as string[];
      const cleaned = original.filter((f) => !/Básico/i.test(f));

      if (cleaned.length !== original.length) {
        console.log("Removing references to 'Básico' from features...");
        await db.update(plans).set({ features: cleaned }).where(eq(plans.id, plan.id));
        console.log(`Updated plan ${plan.id} features from ${JSON.stringify(original)} to ${JSON.stringify(cleaned)}`);
      } else {
        console.log("No 'Básico' references found in features. No update needed.");
      }
    }
  } catch (err) {
    console.error("Error during features cleanup:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();