import { db } from "./src/db";
import { adVariations } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const campaignId = "7c96a370-85b4-4fe7-9c43-023d439df3b0";
  const variations = await db.select().from(adVariations).where(eq(adVariations.campaignId, campaignId));
  console.log(JSON.stringify(variations, null, 2));
  process.exit(0);
}

main();
