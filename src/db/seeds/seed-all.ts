import { client, db, schema } from "./db";
import { seedUsers } from "./users";
import { seedSubjects } from "./subjects";
import { seedClassLevels } from "./class-levels";
import { seedSubjectClassMappings } from "./subject-class-mappings";
import { seedChapters } from "./chapters";
import { seedITQuestions } from "./questions-it";
import { seedScholarshipQuestions } from "./questions-scholarship";
import { seedExamStructures } from "./exam-structures";
import { seedScheduledExams } from "./scheduled-exams";
import { seedSchools } from "./schools";

/**
 * Seed All Database Tables
 * 
 * Seeds all database tables in proper dependency order:
 * 1. Core entities (subjects, class levels)
 * 2. Mappings (subject-class mappings)
 * 3. Dependent entities (chapters)
 * 4. Schools (independent)
 * 5. Users (requires schools for relations)
 * 6. Questions (requires users, chapters, subjects)
 * 7. Exam structures (requires subjects, class levels)
 * 8. Scheduled exams (requires exam structures, subjects, class levels)
 * 
 * Best Practices:
 * - Idempotent: Can be run multiple times safely
 * - Error handling: Continues on non-critical errors
 * - Dependency order: Respects foreign key constraints
 * - Logging: Clear progress indicators
 */
async function seedAll() {
  console.log("🌱 Seeding all database tables...\n");
  console.log("=".repeat(60));
  console.log();

  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // ============================================
    // Phase 1: Core Entities (No Dependencies)
    // ============================================
    console.log("📦 Phase 1: Core Entities");
    console.log("-".repeat(60));
    
    try {
      await seedSubjects();
    } catch (error: any) {
      errors.push(`Subjects: ${error.message}`);
      console.error(`   ❌ Failed to seed subjects: ${error.message}`);
    }

    try {
      await seedClassLevels();
    } catch (error: any) {
      errors.push(`Class Levels: ${error.message}`);
      console.error(`   ❌ Failed to seed class levels: ${error.message}`);
    }

    // ============================================
    // Phase 2: Mappings (Requires Subjects & Class Levels)
    // ============================================
    console.log("\n🔗 Phase 2: Mappings");
    console.log("-".repeat(60));
    
    try {
      await seedSubjectClassMappings();
    } catch (error: any) {
      errors.push(`Subject-Class Mappings: ${error.message}`);
      console.error(`   ❌ Failed to seed mappings: ${error.message}`);
    }

    // ============================================
    // Phase 3: Dependent Entities (Requires Subjects)
    // ============================================
    console.log("\n📖 Phase 3: Dependent Entities");
    console.log("-".repeat(60));
    
    try {
      await seedChapters();
    } catch (error: any) {
      errors.push(`Chapters: ${error.message}`);
      console.error(`   ❌ Failed to seed chapters: ${error.message}`);
    }

    // ============================================
    // Phase 4: Schools (Independent)
    // ============================================
    console.log("\n🏫 Phase 4: Schools");
    console.log("-".repeat(60));
    
    try {
      await seedSchools();
    } catch (error: any) {
      errors.push(`Schools: ${error.message}`);
      console.error(`   ❌ Failed to seed schools: ${error.message}`);
    }

    // ============================================
    // Phase 5: Users (Requires Schools for Relations)
    // ============================================
    console.log("\n👥 Phase 5: Users");
    console.log("-".repeat(60));
    
    try {
      await seedUsers();
    } catch (error: any) {
      errors.push(`Users: ${error.message}`);
      console.error(`   ❌ Failed to seed users: ${error.message}`);
    }

    // ============================================
    // Phase 6: Questions (Requires Users, Chapters, Subjects)
    // ============================================
    console.log("\n❓ Phase 6: Questions");
    console.log("-".repeat(60));
    
    try {
      await seedITQuestions();
    } catch (error: any) {
      errors.push(`IT Questions: ${error.message}`);
      console.error(`   ❌ Failed to seed IT questions: ${error.message}`);
    }

    try {
      await seedScholarshipQuestions();
    } catch (error: any) {
      errors.push(`Scholarship Questions: ${error.message}`);
      console.error(`   ❌ Failed to seed scholarship questions: ${error.message}`);
    }

    // ============================================
    // Phase 7: Exam Structures (Requires Subjects, Class Levels)
    // ============================================
    console.log("\n📋 Phase 7: Exam Structures");
    console.log("-".repeat(60));
    
    try {
      await seedExamStructures();
    } catch (error: any) {
      errors.push(`Exam Structures: ${error.message}`);
      console.error(`   ❌ Failed to seed exam structures: ${error.message}`);
    }

    // ============================================
    // Phase 8: Scheduled Exams (Requires Exam Structures, Subjects, Class Levels)
    // ============================================
    console.log("\n📅 Phase 8: Scheduled Exams");
    console.log("-".repeat(60));
    
    try {
      await seedScheduledExams();
    } catch (error: any) {
      errors.push(`Scheduled Exams: ${error.message}`);
      console.error(`   ❌ Failed to seed scheduled exams: ${error.message}`);
    }

    // ============================================
    // Summary
    // ============================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Database seeding completed!");
    console.log("=".repeat(60));

    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} error(s) occurred (non-critical):`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // Summary statistics
    try {
      const summary = {
        schools: (await db.select().from(schema.schools)).length,
        users: (await db.select().from(schema.profiles)).length,
        subjects: (await db.select().from(schema.subjects)).length,
        classLevels: (await db.select().from(schema.classLevels)).length,
        chapters: (await db.select().from(schema.chapters)).length,
        subjectClassMappings: (await db.select().from(schema.subjectClassMappings)).length,
        itQuestions: (await db.select().from(schema.questionsInformationTechnology)).length,
        scholarshipQuestions: (await db.select().from(schema.questionsScholarship)).length,
        examStructures: (await db.select().from(schema.examStructures)).length,
        scheduledExams: (await db.select().from(schema.scheduledExams)).length,
      };

      console.log("\n📊 Database Summary:");
      console.log("-".repeat(60));
      console.log(`   🏫 Schools:              ${summary.schools}`);
      console.log(`   👥 Users:                ${summary.users}`);
      console.log(`   📚 Subjects:             ${summary.subjects}`);
      console.log(`   🎓 Class Levels:         ${summary.classLevels}`);
      console.log(`   🔗 Subject-Class Maps:   ${summary.subjectClassMappings}`);
      console.log(`   📖 Chapters:             ${summary.chapters}`);
      console.log(`   💻 IT Questions:         ${summary.itQuestions}`);
      console.log(`   🏆 Scholarship Q's:     ${summary.scholarshipQuestions}`);
      console.log(`   📋 Exam Structures:      ${summary.examStructures}`);
      console.log(`   📅 Scheduled Exams:      ${summary.scheduledExams}`);
      console.log(`\n⏱️  Total time: ${duration}s`);
      console.log();

      // Test users summary
      const users = await db.select().from(schema.profiles);
      const adminUsers = users.filter(u => u.role === "admin");
      const teacherUsers = users.filter(u => u.role === "teacher");
      const studentUsers = users.filter(u => u.role === "student");

      if (adminUsers.length > 0 || teacherUsers.length > 0 || studentUsers.length > 0) {
        console.log("👤 Test Users Created:");
        console.log("-".repeat(60));
        adminUsers.forEach(u => {
          console.log(`   🔑 Admin:   ${u.email} (${u.name})`);
        });
        teacherUsers.forEach(u => {
          console.log(`   👨‍🏫 Teacher: ${u.email} (${u.name})`);
        });
        studentUsers.forEach(u => {
          console.log(`   🎓 Student: ${u.email} (${u.name})`);
        });
        console.log();
      }
    } catch (error: any) {
      console.error(`   ⚠️  Could not generate summary: ${error.message}`);
    }

  } catch (error: any) {
    console.error("\n❌ Critical error seeding database:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}
