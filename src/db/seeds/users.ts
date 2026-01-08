import { db, schema, client } from "./db";
import { getSupabaseAdmin } from "@/lib/api/supabase-admin";
import { eq } from "drizzle-orm";

/**
 * Seed test users: admin, teacher, and student
 * Creates both Supabase Auth users and profile records
 * Properly links users with schools for testing
 */
export async function seedUsers() {
  console.log("👥 Seeding test users...");

  const supabase = getSupabaseAdmin();

  // Get a school for linking (if schools exist)
  const schools = await db.select().from(schema.schools).limit(1);
  const defaultSchoolId = schools.length > 0 ? schools[0].id : null;

  // Get multiple schools for better distribution
  const allSchools = await db.select().from(schema.schools).limit(5);
  const schoolIds = allSchools.map(s => s.id);
  const school1 = schoolIds[0] || defaultSchoolId;
  const school2 = schoolIds[1] || defaultSchoolId;
  const school3 = schoolIds[2] || defaultSchoolId;

  // Test users configuration with proper relations
  const testUsers = [
    {
      email: "admin@abhedya.com",
      password: "Admin@123456",
      name: "Admin User",
      role: "admin" as const,
      preferredLanguage: "en" as const,
      schoolId: null, // Admin doesn't need school
      permissions: {
        manageUsers: true,
        manageQuestions: true,
        manageExams: true,
        viewAnalytics: true,
        manageSettings: true,
      },
    },
    {
      email: "teacher@abhedya.com",
      password: "Teacher@123",
      name: "Teacher User",
      role: "teacher" as const,
      preferredLanguage: "en" as const,
      schoolId: school1, // Teacher linked to a school
      permissions: {
        manageQuestions: true,
        viewAnalytics: true,
        manageExams: true,
      },
    },
    {
      email: "teacher2@abhedya.com",
      password: "Teacher@123",
      name: "Teacher 2",
      role: "teacher" as const,
      preferredLanguage: "mr" as const,
      schoolId: school2, // Second teacher at different school
      permissions: {
        manageQuestions: true,
        viewAnalytics: true,
        manageExams: true,
      },
    },
    {
      email: "student@abhedya.com",
      password: "Student@123",
      name: "Student User",
      role: "student" as const,
      preferredLanguage: "mr" as const,
      classLevel: "12",
      schoolId: school1, // Student linked to a school
      permissions: {},
    },
    {
      email: "student2@abhedya.com",
      password: "Student@123",
      name: "Student 2",
      role: "student" as const,
      preferredLanguage: "en" as const,
      classLevel: "8",
      schoolId: school1, // Student in Class 8
      permissions: {},
    },
    {
      email: "student3@abhedya.com",
      password: "Student@123",
      name: "Student 3",
      role: "student" as const,
      preferredLanguage: "mr" as const,
      classLevel: "11",
      schoolId: school2, // Student at different school
      permissions: {},
    },
    {
      email: "student4@abhedya.com",
      password: "Student@123",
      name: "Student 4",
      role: "student" as const,
      preferredLanguage: "mr" as const,
      classLevel: "12",
      schoolId: school3, // Another student
      permissions: {},
    },
  ];

  const createdProfiles = [];

  for (const userData of testUsers) {
    try {
      // Check if profile already exists
      const existingProfiles = await db.select().from(schema.profiles);
      const existingProfile = existingProfiles.find((p) => p.email === userData.email);

      let userId: string;
      let isNewUser = false;

      if (existingProfile) {
        // Profile exists, use existing ID
        userId = existingProfile.id;
        console.log(`   ℹ User ${userData.email} already exists, updating profile...`);
        
        // Update profile to ensure it has correct data
        const [updatedProfile] = await db
          .update(schema.profiles)
          .set({
            name: userData.name,
            role: userData.role,
            preferredLanguage: userData.preferredLanguage,
            classLevel: userData.classLevel || null,
            schoolId: userData.schoolId || null,
            permissions: userData.permissions,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.profiles.id, userId))
          .returning();
        
        createdProfiles.push(updatedProfile);
        console.log(`   ✓ Updated ${userData.role}: ${userData.email}`);
        continue;
      }

      // Check if auth user exists
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingAuthUsers?.users.find((u) => u.email === userData.email);

      if (existingAuthUser) {
        // Auth user exists but no profile, create profile
        userId = existingAuthUser.id;
        console.log(`   ℹ Auth user ${userData.email} exists, creating profile...`);
      } else {
        // Create new Supabase Auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm for testing
          user_metadata: {
            name: userData.name,
            role: userData.role,
          },
        });

        if (authError) {
          // If user already exists in auth, try to get it
          if (authError.message.includes("already been registered")) {
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const foundUser = authUsers?.users.find((u) => u.email === userData.email);
            if (foundUser) {
              userId = foundUser.id;
              console.log(`   ℹ Auth user ${userData.email} already exists, using existing ID`);
            } else {
              console.error(`   ❌ Error creating auth user ${userData.email}:`, authError.message);
              continue;
            }
          } else {
            console.error(`   ❌ Error creating auth user ${userData.email}:`, authError.message);
            continue;
          }
        } else if (authData?.user) {
          userId = authData.user.id;
          isNewUser = true;
        } else {
          console.error(`   ❌ No user data returned for ${userData.email}`);
          continue;
        }
      }

      // Create profile record with proper relations
      const [profile] = await db
        .insert(schema.profiles)
        .values({
          id: userId,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          preferredLanguage: userData.preferredLanguage,
          classLevel: userData.classLevel || null,
          schoolId: userData.schoolId || null,
          permissions: userData.permissions,
          isActive: true,
        })
        .returning();

      createdProfiles.push(profile);
      console.log(`   ✓ ${isNewUser ? "Created" : "Linked"} ${userData.role}: ${userData.email} (ID: ${userId})`);
    } catch (error: any) {
      // Handle duplicate key error (profile already exists)
      if (error?.cause?.code === "23505" || error?.message?.includes("duplicate key")) {
        console.log(`   ⚠ Profile for ${userData.email} already exists, skipping...`);
        const existingProfiles = await db.select().from(schema.profiles);
        const existingProfile = existingProfiles.find((p) => p.email === userData.email);
        if (existingProfile) {
          createdProfiles.push(existingProfile);
        }
      } else {
        console.error(`   ❌ Error creating user ${userData.email}:`, error.message || error);
      }
    }
  }

  console.log(`   ✓ Created ${createdProfiles.length} test users\n`);

  // Print summary
  console.log("📋 Test Users Summary:");
  console.log("   Admin:   admin@abhedya.com / Admin@123456");
  console.log("   Teacher: teacher@abhedya.com / Teacher@123");
  console.log("   Teacher: teacher2@abhedya.com / Teacher@123");
  console.log("   Student: student@abhedya.com / Student@123 (Class 12)");
  console.log("   Student: student2@abhedya.com / Student@123 (Class 8)");
  console.log("   Student: student3@abhedya.com / Student@123 (Class 11)");
  console.log("   Student: student4@abhedya.com / Student@123 (Class 12)\n");

  return createdProfiles;
}

// Run if executed directly
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("/seed/users.ts")) {
  seedUsers()
    .then(() => {
      console.log("✅ Users seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding users:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}
