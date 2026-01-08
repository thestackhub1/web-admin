import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  console.log('=== Class Levels ===');
  const classLevels = await db.select().from(schema.classLevels);
  console.log('Count:', classLevels.length);
  classLevels.forEach(cl => console.log('  -', cl.nameEn, '| slug:', cl.slug, '| active:', cl.isActive));
  
  console.log('\n=== Scheduled Exams ===');
  const scheduledExams = await db.select().from(schema.scheduledExams).limit(10);
  console.log('Count:', scheduledExams.length);
  scheduledExams.forEach(e => console.log('  -', e.nameEn, '| status:', e.status));
  
  console.log('\n=== Exam Attempts (exams table) ===');
  const exams = await db.select().from(schema.exams).limit(10);
  console.log('Count:', exams.length);
  exams.forEach(e => console.log('  -', e.id, '| status:', e.status, '| score:', e.score));
  
  console.log('\n=== Profiles ===');
  const profiles = await db.select().from(schema.profiles).limit(10);
  console.log('Count:', profiles.length);
  profiles.forEach(p => console.log('  -', p.email, '| role:', p.role, '| name:', p.name));
  
  console.log('\n=== Exam Structures ===');
  const examStructures = await db.select().from(schema.examStructures).limit(10);
  console.log('Count:', examStructures.length);
  examStructures.forEach(e => console.log('  -', e.nameEn, '| active:', e.isActive));
  
  console.log('\n=== Schools ===');
  const schools = await db.select().from(schema.schools).limit(10);
  console.log('Count:', schools.length);
  schools.forEach(s => console.log('  -', s.name, '| verified:', s.isVerified));
  
  console.log('\n=== Questions ===');
  const questions = await db.select().from(schema.questions).limit(5);
  console.log('Count:', questions.length);
  
  await client.end();
}

main().catch(console.error);
