import { db, schema, client } from "./db";
import { randomUUID } from "crypto";

/**
 * Seed Scheduled Exams
 * Creates scheduled exam instances linked to exam structures, subjects, and class levels
 * Properly handles relations and provides test data for admin/teacher testing
 */
export async function seedScheduledExams() {
  console.log("📅 Seeding scheduled exams...");

  try {
    // Clear existing scheduled exams
    await db.delete(schema.scheduledExams);
    console.log("   ✓ Cleared existing scheduled exams");
  } catch (_error: unknown) {
    console.warn("   ⚠️  Could not clear scheduled exams, continuing...");
  }

  // Get subjects and class levels
  const allSubjects = await db.select().from(schema.subjects);
  const allClassLevels = await db.select().from(schema.classLevels);

  // Find subjects using correct slugs
  const itSubject = allSubjects.find((s) => s.slug === "information_technology");
  const scholarshipCategory = allSubjects.find((s) => s.slug === "scholarship" && s.isCategory);

  // Find class levels
  const class8 = allClassLevels.find((c) => c.slug === "class-8");
  const class12 = allClassLevels.find((c) => c.slug === "class-12");

  // Get exam structures for linking
  const allExamStructures = await db.select().from(schema.examStructures);
  const itExamStructure = allExamStructures.find((es) => 
    es.subjectId === itSubject?.id && es.classLevelId === class12?.id
  );
  const scholarshipExamStructure = allExamStructures.find((es) => 
    es.subjectId === scholarshipCategory?.id && es.classLevelId === class8?.id
  );

  const now = new Date().toISOString();
  const scheduledExamsData: (typeof schema.scheduledExams.$inferInsert)[] = [];

  // IT Exams (Class 12) - Link to exam structures
  if (itSubject && class12) {
    scheduledExamsData.push(
      {
        id: randomUUID(),
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Unit Test 1",
        nameMr: "घटक चाचणी १",
        descriptionEn: "First unit test for Class 12 IT",
        descriptionMr: "बारावी IT साठी पहिली घटक चाचणी",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 1,
        status: "draft",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Unit Test 2",
        nameMr: "घटक चाचणी २",
        descriptionEn: "Second unit test for Class 12 IT",
        descriptionMr: "बारावी IT साठी दुसरी घटक चाचणी",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 2,
        status: "draft",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Mid-Term Exam",
        nameMr: "सत्र परीक्षा",
        descriptionEn: "Mid-term examination for Class 12 IT",
        descriptionMr: "बारावी IT साठी सत्र परीक्षा",
        totalMarks: 50,
        durationMinutes: 90,
        orderIndex: 3,
        status: "scheduled",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        scheduledTime: "10:00:00",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Preliminary Exam",
        nameMr: "प्राथमिक परीक्षा",
        descriptionEn: "Preliminary exam preparation for board exam",
        descriptionMr: "बोर्ड परीक्षेसाठी प्राथमिक परीक्षा",
        totalMarks: 80,
        durationMinutes: 180,
        orderIndex: 4,
        status: "draft",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Final Board Exam",
        nameMr: "अंतिम बोर्ड परीक्षा",
        descriptionEn: "Final board examination for Class 12 IT",
        descriptionMr: "बारावी IT साठी अंतिम बोर्ड परीक्षा",
        totalMarks: 80,
        durationMinutes: 180,
        orderIndex: 5,
        status: "draft",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
  }

  // Scholarship Exams (Class 8) - Link to exam structures
  if (scholarshipCategory && class8) {
    scheduledExamsData.push(
      {
        id: randomUUID(),
        classLevelId: class8.id,
        subjectId: scholarshipCategory.id,
        examStructureId: scholarshipExamStructure?.id || null,
        nameEn: "Scholarship Practice Test 1",
        nameMr: "शिष्यवृत्ती सराव चाचणी १",
        descriptionEn: "Practice test for Scholarship exam preparation",
        descriptionMr: "शिष्यवृत्ती परीक्षेच्या तयारीसाठी सराव चाचणी",
        totalMarks: 150,
        durationMinutes: 90,
        orderIndex: 1,
        status: "draft",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        classLevelId: class8.id,
        subjectId: scholarshipCategory.id,
        examStructureId: scholarshipExamStructure?.id || null,
        nameEn: "Scholarship Practice Test 2",
        nameMr: "शिष्यवृत्ती सराव चाचणी २",
        descriptionEn: "Second practice test for Scholarship exam",
        descriptionMr: "शिष्यवृत्ती परीक्षेसाठी दुसरी सराव चाचणी",
        totalMarks: 150,
        durationMinutes: 90,
        orderIndex: 2,
        status: "scheduled",
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        scheduledTime: "09:00:00",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        classLevelId: class8.id,
        subjectId: scholarshipCategory.id,
        examStructureId: scholarshipExamStructure?.id || null,
        nameEn: "Scholarship Mock Exam",
        nameMr: "शिष्यवृत्ती मॉक परीक्षा",
        descriptionEn: "Mock exam simulating actual Scholarship exam",
        descriptionMr: "वास्तविक शिष्यवृत्ती परीक्षेची नक्कल करणारी मॉक परीक्षा",
        totalMarks: 300, // Both papers combined
        durationMinutes: 180,
        orderIndex: 3,
        status: "draft",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
  }

  if (scheduledExamsData.length > 0) {
    try {
      const scheduledExams = await db
        .insert(schema.scheduledExams)
        .values(scheduledExamsData)
        .returning();

      console.log(`   ✓ Created ${scheduledExams.length} scheduled exams:`);
      scheduledExams.forEach((exam) => {
        console.log(`      - ${exam.nameEn} (${exam.status})`);
      });
      console.log();
      return scheduledExams;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error inserting scheduled exams: ${message}`);
      throw error;
    }
  } else {
    console.log("   ⚠️  No scheduled exams created (missing dependencies)\n");
  }

  return [];
}

// Run if executed directly (not when imported)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed/scheduled-exams.ts')) {
  seedScheduledExams()
    .then(() => {
      console.log("✅ Scheduled exams seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding scheduled exams:", error);
      process.exit(1);
    })
    .finally(() => client.close());
}
