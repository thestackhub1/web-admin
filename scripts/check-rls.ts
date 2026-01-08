import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  
  // Check RLS status on subjects table
  const rlsEnabled = await client`
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'subjects'
  `;
  console.log('RLS enabled on subjects:', rlsEnabled[0]?.relrowsecurity);
  
  // Check RLS policies
  const policies = await client`
    SELECT pol.polname, pol.polpermissive, pol.polroles, pol.polcmd
    FROM pg_policies pol
    WHERE pol.tablename = 'subjects'
  `;
  console.log('\nRLS Policies on subjects:', policies.length ? JSON.stringify(policies, null, 2) : 'None');
  
  // Check if table has force_row_security
  const forceRls = await client`
    SELECT relforcerowsecurity
    FROM pg_class
    WHERE relname = 'subjects'
  `;
  console.log('\nForce RLS on subjects:', forceRls[0]?.relforcerowsecurity);
  
  await client.end();
}

main().catch(console.error);
