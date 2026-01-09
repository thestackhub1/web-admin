import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  console.log('Checking questions tables...\n');
  
  // Check scholarship questions
  const schQ = await db.select().from(schema.questionsScholarship).limit(5);
  console.log('Scholarship questions:', schQ.length);
  
  // Check english questions
  const engQ = await db.select().from(schema.questionsEnglish).limit(5);
  console.log('English questions:', engQ.length);
  
  // Check IT questions
  const itQ = await db.select().from(schema.questionsInformationTechnology).limit(5);
  console.log('IT questions:', itQ.length);
  
  console.log('\nTotal:', schQ.length + engQ.length + itQ.length);
  
  if (schQ.length > 0) {
    console.log('\nSample scholarship question:');
    console.log('  ID:', schQ[0].id);
    console.log('  Text:', schQ[0].questionText?.slice(0, 100) + '...');
    console.log('  Type:', schQ[0].questionType);
    console.log('  Active:', schQ[0].isActive);
  }
  
  await client.end();
}

main().catch(console.error);
