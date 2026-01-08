/**
 * Check Schools Data
 * Run with: pnpm dlx tsx scripts/check-schools.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { count } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('📊 Checking schools data...\n');

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // Count schools
    const [schoolCount] = await db.select({ count: count() }).from(schema.schools);
    console.log(`📚 Total Schools: ${schoolCount.count}`);

    // Get sample schools
    const sampleSchools = await db
      .select({
        id: schema.schools.id,
        name: schema.schools.name,
        city: schema.schools.locationCity,
        state: schema.schools.locationState,
        isVerified: schema.schools.isVerified,
        studentCount: schema.schools.studentCount,
      })
      .from(schema.schools)
      .limit(10);

    if (sampleSchools.length > 0) {
      console.log('\n📋 Sample Schools:');
      sampleSchools.forEach((school, i) => {
        console.log(`  ${i + 1}. ${school.name}`);
        console.log(`     - City: ${school.city || 'N/A'}`);
        console.log(`     - State: ${school.state || 'N/A'}`);
        console.log(`     - Verified: ${school.isVerified ? 'Yes' : 'No'}`);
        console.log(`     - Students: ${school.studentCount || 0}`);
      });
    } else {
      console.log('\n⚠️ No schools found in database');
    }

    // Count profiles
    const [profileCount] = await db.select({ count: count() }).from(schema.profiles);
    console.log(`\n👥 Total Profiles: ${profileCount.count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

main();
