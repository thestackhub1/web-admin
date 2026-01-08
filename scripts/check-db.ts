import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  console.log('Checking subjects table...');
  const subjects = await db.select().from(schema.subjects).limit(10);
  console.log('Subjects found:', subjects.length);
  subjects.forEach(s => console.log(`  - ${s.nameEn} (${s.slug}) | category: ${s.isCategory} | active: ${s.isActive}`));
  
  console.log('\nChecking chapters table...');
  const chapters = await db.select().from(schema.chapters).limit(10);
  console.log('Chapters found:', chapters.length);
  
  await client.end();
}

main().catch(console.error);

// Also test stats
async function checkStats() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  // Direct stats queries like SubjectsService.getStats
  const [categoriesCount] = await db.execute(sql`
    SELECT count(*) as count FROM subjects 
    WHERE is_active = true AND is_category = true AND parent_subject_id IS NULL
  `);
  
  const [rootSubjectsCount] = await db.execute(sql`
    SELECT count(*) as count FROM subjects 
    WHERE is_active = true AND is_category = false AND parent_subject_id IS NULL
  `);
  
  const [chaptersCount] = await db.execute(sql`
    SELECT count(*) as count FROM chapters 
    WHERE is_active = true
  `);
  
  console.log('\nStats:');
  console.log('Categories:', categoriesCount);
  console.log('Root Subjects:', rootSubjectsCount);
  console.log('Chapters:', chaptersCount);
  
  await client.end();
}

import { sql } from 'drizzle-orm';
checkStats().catch(console.error);
