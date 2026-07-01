import { db } from "./src/db";
import { businesses } from "./src/db/schema";

async function main() {
  const allBusinesses = await db.select().from(businesses).limit(5);
  console.log(JSON.stringify(allBusinesses, null, 2));
  process.exit(0);
}

main();
