import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, isNull, sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  console.log('Checking subjects with stats logic...\n');
  
  // Use same queries as SubjectsService.getStats
  const [totalCategoriesResult] = await db.select({ count: sql<number>`count(*)`.as('count') })
    .from(schema.subjects)
    .where(and(
      eq(schema.subjects.isActive, true),
      eq(schema.subjects.isCategory, true),
      isNull(schema.subjects.parentSubjectId)
    ));
  
  const [rootSubjectsResult] = await db.select({ count: sql<number>`count(*)`.as('count') })
    .from(schema.subjects)
    .where(and(
      eq(schema.subjects.isActive, true),
      eq(schema.subjects.isCategory, false),
      isNull(schema.subjects.parentSubjectId)
    ));
  
  const [totalChaptersResult] = await db.select({ count: sql<number>`count(*)`.as('count') })
    .from(schema.chapters)
    .where(eq(schema.chapters.isActive, true));
  
  console.log('Stats using SubjectsService.getStats logic:');
  console.log('  Total Categories:', totalCategoriesResult?.count || 0);
  console.log('  Root Subjects (non-category, no parent):', rootSubjectsResult?.count || 0);
  console.log('  Total Chapters:', totalChaptersResult?.count || 0);
  
  // Also list all subjects with their structure
  console.log('\nAll subjects:');
  const allSubjects = await db.select().from(schema.subjects).orderBy(schema.subjects.orderIndex);
  allSubjects.forEach(s => {
    console.log(`  - ${s.nameEn} | slug: ${s.slug} | category: ${s.isCategory} | parent: ${s.parentSubjectId || 'null'} | active: ${s.isActive}`);
  });
  
  await client.end();
}

main().catch(console.error);
