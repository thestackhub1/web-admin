import { db, schema, client } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Salt rounds for bcrypt
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Seed test users: admin, teacher, and student
 * Creates profile records with hashed passwords
 * Now uses custom JWT auth (no more Supabase Auth)
 */
export async function seedUsers() {
  console.log("👥 Seeding test users...");

  // Get a school for linking (if schools exist)
  const schools = await db.select().from(schema.schools).limit(1);
  const defaultSchoolId = schools.length > 0 ? schools[0].id : null;

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
      schoolId: defaultSchoolId, // Teacher linked to a school
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
      schoolId: defaultSchoolId, // Student linked to a school
      permissions: {},
    },
  ];

  const createdProfiles = [];

  for (const userData of testUsers) {
    try {
      // Check if profile already exists
      const existingProfiles = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.email, userData.email));
      
      const existingProfile = existingProfiles[0];

      if (existingProfile) {
        // Profile exists, update it
        console.log(`   ℹ User ${userData.email} already exists, updating profile...`);
        
        // Hash the password
        const passwordHash = await hashPassword(userData.password);
        
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
            passwordHash: passwordHash,
            isActive: true,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.profiles.id, existingProfile.id))
          .returning();
        
        createdProfiles.push(updatedProfile);
        console.log(`   ✓ Updated ${userData.role}: ${userData.email}`);
        continue;
      }

      // Generate new UUID for the user
      const userId = randomUUID();
      
      // Hash the password
      const passwordHash = await hashPassword(userData.password);

      // Create profile record with hashed password
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
          passwordHash: passwordHash,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      createdProfiles.push(profile);
      console.log(`   ✓ Created ${userData.role}: ${userData.email} (ID: ${userId})`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : { message: String(error), cause: undefined as unknown };
      // Handle duplicate key error (profile already exists)
      const causeCode = (err.cause as { code?: string })?.code;
      if (causeCode === "23505" || err.message?.includes("duplicate key") || err.message?.includes("UNIQUE constraint")) {
        console.log(`   ⚠ Profile for ${userData.email} already exists, skipping...`);
        const existingProfiles = await db
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.email, userData.email));
        if (existingProfiles[0]) {
          createdProfiles.push(existingProfiles[0]);
        }
      } else {
        console.error(`   ❌ Error creating user ${userData.email}:`, err.message || error);
      }
    }
  }

  console.log(`   ✓ Created ${createdProfiles.length} test users\n`);

  // Print summary
  console.log("📋 Test Users Summary:");
  console.log("   Admin:   admin@abhedya.com / Admin@123456");
  console.log("   Teacher: teacher@abhedya.com / Teacher@123");
  console.log("   Student: student@abhedya.com / Student@123\n");

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
    .finally(() => client.close());
}
