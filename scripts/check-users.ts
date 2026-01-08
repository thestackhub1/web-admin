import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  console.log('Checking user profiles...');
  const profiles = await db.select().from(schema.profiles).limit(10);
  
  console.log('Profiles found:', profiles.length);
  profiles.forEach(p => console.log(`  - ${p.email}: role=${p.role}, active=${p.isActive}`));
  
  await client.end();
}

main().catch(console.error);
