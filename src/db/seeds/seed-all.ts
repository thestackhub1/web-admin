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

async function seedAll() {
  console.log("🌱 Seeding all database tables...\n");

  try {
    // Seed in order of dependencies
    await seedSubjects();
    await seedClassLevels();
    await seedSubjectClassMappings();
    await seedChapters();
    
    // Seed schools (independent, can be seeded early)
    await seedSchools();
    
    // Seed users (creates auth users and profiles)
    await seedUsers();
    
    // Seed questions for different subjects
    await seedITQuestions();
    await seedScholarshipQuestions();
    
    await seedExamStructures();
    await seedScheduledExams();

    console.log("✅ All database seeding completed successfully!\n");

    // Summary
    const summary = {
      schools: (await db.select().from(schema.schools)).length,
      users: (await db.select().from(schema.profiles)).length,
      subjects: (await db.select().from(schema.subjects)).length,
      classLevels: (await db.select().from(schema.classLevels)).length,
      chapters: (await db.select().from(schema.chapters)).length,
      itQuestions: (await db.select().from(schema.questionsInformationTechnology)).length,
      scholarshipQuestions: (await db.select().from(schema.questionsScholarship)).length,
      examStructures: (await db.select().from(schema.examStructures)).length,
      scheduledExams: (await db.select().from(schema.scheduledExams)).length,
    };

    console.log("📊 Summary:");
    console.log(`   Schools: ${summary.schools}`);
    console.log(`   Users: ${summary.users}`);
    console.log(`   Subjects: ${summary.subjects}`);
    console.log(`   Class Levels: ${summary.classLevels}`);
    console.log(`   Chapters: ${summary.chapters}`);
    console.log(`   IT Questions: ${summary.itQuestions}`);
    console.log(`   Scholarship Questions: ${summary.scholarshipQuestions}`);
    console.log(`   Exam Structures: ${summary.examStructures}`);
    console.log(`   Scheduled Exams: ${summary.scheduledExams}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await client.close();
  }
}

seedAll();
