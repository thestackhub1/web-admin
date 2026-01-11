import { db, schema, client } from "./db";
import { eq } from "drizzle-orm";

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
  } catch (error: any) {
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

  const scheduledExamsData: any[] = [];

  // IT Exams (Class 12) - Link to exam structures
  if (itSubject && class12) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    scheduledExamsData.push(
      {
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
        status: "completed",
        scheduledDate: yesterday.toISOString().split('T')[0],
        scheduledTime: "10:00:00",
        publishResults: true,
        isActive: true,
      },
      {
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
        status: "active",
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: "14:00:00",
        publishResults: false,
        isActive: true,
      },
      {
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
        scheduledDate: nextWeek.toISOString().split('T')[0],
        scheduledTime: "10:00:00",
        publishResults: false,
        isActive: true,
      },
      {
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
        status: "scheduled",
        scheduledDate: nextMonth.toISOString().split('T')[0],
        scheduledTime: "09:00:00",
        publishResults: false,
        isActive: true,
      },
      {
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
      },
      {
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Practice Test 1",
        nameMr: "सराव चाचणी १",
        descriptionEn: "Practice test for Class 12 IT students",
        descriptionMr: "बारावी IT विद्यार्थ्यांसाठी सराव चाचणी",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 6,
        status: "draft",
        maxAttempts: 3,
        isActive: true,
      },
      {
        classLevelId: class12.id,
        subjectId: itSubject.id,
        examStructureId: itExamStructure?.id || null,
        nameEn: "Practice Test 2",
        nameMr: "सराव चाचणी २",
        descriptionEn: "Second practice test for Class 12 IT students",
        descriptionMr: "बारावी IT विद्यार्थ्यांसाठी दुसरी सराव चाचणी",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 7,
        status: "scheduled",
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: "15:00:00",
        maxAttempts: 2,
        isActive: true,
      }
    );
  }

  // Find Class 11 for IT exams
  const class11 = allClassLevels.find((c) => c.slug === "class-11");
  const class11ExamStructure = allExamStructures.find((es) => 
    es.subjectId === itSubject?.id && es.classLevelId === class11?.id
  );

  // IT Exams (Class 11) - Link to exam structures
  if (itSubject && class11) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonths = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    scheduledExamsData.push(
      // Completed exams
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Chapter 1 Test - Introduction to IT",
        nameMr: "अध्याय १ चाचणी - IT चा परिचय",
        descriptionEn: "Chapter test on Introduction to Information Technology",
        descriptionMr: "माहिती तंत्रज्ञानाच्या परिचयावर अध्याय चाचणी",
        totalMarks: 15,
        durationMinutes: 30,
        orderIndex: 1,
        status: "completed",
        scheduledDate: lastWeek.toISOString().split('T')[0],
        scheduledTime: "10:00:00",
        publishResults: true,
        isActive: true,
      },
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Unit Test 1 - Basics of IT",
        nameMr: "घटक चाचणी १ - IT मूलभूत",
        descriptionEn: "First unit test covering basics of IT",
        descriptionMr: "IT मूलभूत गोष्टी समाविष्ट करणारी पहिली घटक चाचणी",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 2,
        status: "completed",
        scheduledDate: twoDaysAgo.toISOString().split('T')[0],
        scheduledTime: "11:00:00",
        publishResults: true,
        isActive: true,
      },
      // Active exam
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Chapter 2 Test - Computer Networks",
        nameMr: "अध्याय २ चाचणी - संगणक नेटवर्क",
        descriptionEn: "Chapter test on Computer Networks",
        descriptionMr: "संगणक नेटवर्क वर अध्याय चाचणी",
        totalMarks: 15,
        durationMinutes: 30,
        orderIndex: 3,
        status: "active",
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: "14:00:00",
        publishResults: false,
        isActive: true,
      },
      // Scheduled exams
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Unit Test 2 - Networks & Internet",
        nameMr: "घटक चाचणी २ - नेटवर्क आणि इंटरनेट",
        descriptionEn: "Second unit test on Networks and Internet",
        descriptionMr: "नेटवर्क आणि इंटरनेट वर दुसरी घटक चाचणी",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 4,
        status: "scheduled",
        scheduledDate: nextWeek.toISOString().split('T')[0],
        scheduledTime: "10:00:00",
        publishResults: false,
        isActive: true,
      },
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Semester 1 Exam",
        nameMr: "सत्र १ परीक्षा",
        descriptionEn: "First semester examination for Class 11 IT",
        descriptionMr: "अकरावी IT साठी पहिली सत्र परीक्षा",
        totalMarks: 50,
        durationMinutes: 90,
        orderIndex: 5,
        status: "scheduled",
        scheduledDate: twoWeeks.toISOString().split('T')[0],
        scheduledTime: "09:00:00",
        publishResults: false,
        isActive: true,
      },
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Chapter 3 Test - Web Technologies",
        nameMr: "अध्याय ३ चाचणी - वेब तंत्रज्ञान",
        descriptionEn: "Chapter test on Web Technologies",
        descriptionMr: "वेब तंत्रज्ञान वर अध्याय चाचणी",
        totalMarks: 15,
        durationMinutes: 30,
        orderIndex: 6,
        status: "scheduled",
        scheduledDate: nextMonth.toISOString().split('T')[0],
        scheduledTime: "10:00:00",
        publishResults: false,
        isActive: true,
      },
      // Draft exams
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Annual Exam",
        nameMr: "वार्षिक परीक्षा",
        descriptionEn: "Annual examination for Class 11 IT",
        descriptionMr: "अकरावी IT साठी वार्षिक परीक्षा",
        totalMarks: 80,
        durationMinutes: 180,
        orderIndex: 7,
        status: "draft",
        isActive: true,
      },
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Practice Test - Chapter 1 to 3",
        nameMr: "सराव चाचणी - अध्याय १ ते ३",
        descriptionEn: "Practice test covering Chapters 1 to 3",
        descriptionMr: "अध्याय १ ते ३ समाविष्ट करणारी सराव चाचणी",
        totalMarks: 20,
        durationMinutes: 30,
        orderIndex: 8,
        status: "draft",
        maxAttempts: 5,
        isActive: true,
      },
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Revision Test 1",
        nameMr: "पुनरावलोकन चाचणी १",
        descriptionEn: "Quick revision test for Class 11 IT",
        descriptionMr: "अकरावी IT साठी द्रुत पुनरावलोकन चाचणी",
        totalMarks: 20,
        durationMinutes: 30,
        orderIndex: 9,
        status: "draft",
        maxAttempts: 0, // Unlimited
        isActive: true,
      },
      // Cancelled exam (for testing UI)
      {
        classLevelId: class11.id,
        subjectId: itSubject.id,
        examStructureId: class11ExamStructure?.id || null,
        nameEn: "Unit Test 3 (Cancelled)",
        nameMr: "घटक चाचणी ३ (रद्द)",
        descriptionEn: "This exam was cancelled due to schedule conflict",
        descriptionMr: "वेळापत्रक संघर्षामुळे ही परीक्षा रद्द करण्यात आली",
        totalMarks: 25,
        durationMinutes: 45,
        orderIndex: 10,
        status: "cancelled",
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: "11:00:00",
        isActive: false,
      }
    );
  }

  // Scholarship Exams (Class 8) - Link to exam structures
  if (scholarshipCategory && class8) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    scheduledExamsData.push(
      {
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
        maxAttempts: 5,
        isActive: true,
      },
      {
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
        scheduledDate: twoWeeks.toISOString().split('T')[0],
        scheduledTime: "09:00:00",
        maxAttempts: 3,
        isActive: true,
      },
      {
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
        status: "scheduled",
        scheduledDate: nextMonth.toISOString().split('T')[0],
        scheduledTime: "10:00:00",
        maxAttempts: 1,
        publishResults: true,
        isActive: true,
      },
      {
        classLevelId: class8.id,
        subjectId: scholarshipCategory.id,
        examStructureId: scholarshipExamStructure?.id || null,
        nameEn: "Scholarship Quick Test",
        nameMr: "शिष्यवृत्ती द्रुत चाचणी",
        descriptionEn: "Quick assessment test for Scholarship preparation",
        descriptionMr: "शिष्यवृत्ती तयारीसाठी द्रुत मूल्यांकन चाचणी",
        totalMarks: 50,
        durationMinutes: 30,
        orderIndex: 4,
        status: "draft",
        maxAttempts: 10,
        isActive: true,
      },
      {
        classLevelId: class8.id,
        subjectId: scholarshipCategory.id,
        examStructureId: scholarshipExamStructure?.id || null,
        nameEn: "Scholarship Final Mock",
        nameMr: "शिष्यवृत्ती अंतिम मॉक",
        descriptionEn: "Final mock exam before actual Scholarship exam",
        descriptionMr: "वास्तविक शिष्यवृत्ती परीक्षेपूर्वी अंतिम मॉक परीक्षा",
        totalMarks: 300,
        durationMinutes: 180,
        orderIndex: 5,
        status: "draft",
        maxAttempts: 1,
        publishResults: true,
        isActive: true,
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
    } catch (error: any) {
      console.error(`   ❌ Error inserting scheduled exams: ${error.message}`);
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
    .finally(() => client.end());
}
