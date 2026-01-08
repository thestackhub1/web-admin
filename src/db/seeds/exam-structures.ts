import { db, schema, client } from "./db";

/**
 * Seed Exam Structures (Blueprints)
 * Creates exam structure templates linked to subjects and class levels
 * Properly handles relations and provides test data for admin/teacher testing
 */
export async function seedExamStructures() {
  console.log("📋 Seeding exam structures...");

  try {
    // Clear existing exam structures
    await db.delete(schema.examStructures);
    console.log("   ✓ Cleared existing exam structures");
  } catch (error: any) {
    console.warn("   ⚠️  Could not clear exam structures, continuing...");
  }

  // Get subjects and class levels
  const allSubjects = await db.select().from(schema.subjects);
  const allClassLevels = await db.select().from(schema.classLevels);

  // Find subjects using correct slugs
  const itSubject = allSubjects.find((s) => s.slug === "information_technology");
  const scholarshipCategory = allSubjects.find((s) => s.slug === "scholarship" && s.isCategory);
  const scholarshipMarathi = allSubjects.find((s) => s.slug === "scholarship-marathi");
  const scholarshipMath = allSubjects.find((s) => s.slug === "scholarship-mathematics");
  const scholarshipIntelligence = allSubjects.find((s) => s.slug === "scholarship-intelligence-test");
  const scholarshipGK = allSubjects.find((s) => s.slug === "scholarship-general-knowledge");

  // Find class levels
  const class8 = allClassLevels.find((c) => c.slug === "class-8");
  const class12 = allClassLevels.find((c) => c.slug === "class-12");

  const examStructuresData: any[] = [];

  // IT Exam Structures (Class 12)
  if (itSubject && class12) {
    examStructuresData.push(
      {
        subjectId: itSubject.id,
        classLevelId: class12.id,
        nameEn: "Class 12 IT Board Exam Pattern",
        nameMr: "बारावी IT बोर्ड परीक्षा पॅटर्न",
        descriptionEn: "Maharashtra State Board Class 12 IT exam pattern - 80 marks",
        descriptionMr: "महाराष्ट्र राज्य बोर्ड बारावी IT परीक्षा पॅटर्न - 80 गुण",
        classLevel: "class_12",
        durationMinutes: 180,
        totalQuestions: 54,
        totalMarks: 80,
        passingPercentage: 35,
        isTemplate: true,
        sections: [
          {
            id: "q1",
            code: "q1",
            name_en: "Fill in the Blanks",
            name_mr: "रिकाम्या जागा भरा",
            question_type: "fill_blank",
            question_count: 10,
            marks_per_question: 1,
            total_marks: 10,
            order_index: 1,
          },
          {
            id: "q2",
            code: "q2",
            name_en: "True or False",
            name_mr: "खरे की खोटे",
            question_type: "true_false",
            question_count: 10,
            marks_per_question: 1,
            total_marks: 10,
            order_index: 2,
          },
          {
            id: "q3",
            code: "q3",
            name_en: "MCQ (Single Correct)",
            name_mr: "बहुपर्यायी (एक योग्य)",
            question_type: "mcq_single",
            question_count: 10,
            marks_per_question: 1,
            total_marks: 10,
            order_index: 3,
          },
          {
            id: "q4",
            code: "q4",
            name_en: "MCQ (Two Correct)",
            name_mr: "बहुपर्यायी (दोन योग्य)",
            question_type: "mcq_two",
            question_count: 10,
            marks_per_question: 2,
            total_marks: 20,
            order_index: 4,
          },
        ],
        isActive: true,
      },
      {
        subjectId: itSubject.id,
        classLevelId: class12.id,
        nameEn: "Unit Test Pattern (25 marks)",
        nameMr: "घटक चाचणी पॅटर्न (25 गुण)",
        descriptionEn: "Standard unit test format",
        descriptionMr: "मानक घटक चाचणी स्वरूप",
        classLevel: "class_12",
        durationMinutes: 45,
        totalQuestions: 20,
        totalMarks: 25,
        passingPercentage: 35,
        isTemplate: true,
        sections: [
          {
            id: "s1",
            code: "s1",
            name_en: "Fill in the Blanks",
            name_mr: "रिकाम्या जागा भरा",
            question_type: "fill_blank",
            question_count: 5,
            marks_per_question: 1,
            total_marks: 5,
            order_index: 1,
          },
          {
            id: "s2",
            code: "s2",
            name_en: "MCQ",
            name_mr: "बहुपर्यायी",
            question_type: "mcq_single",
            question_count: 10,
            marks_per_question: 1,
            total_marks: 10,
            order_index: 2,
          },
          {
            id: "s3",
            code: "s3",
            name_en: "Short Answer",
            name_mr: "लघु उत्तर",
            question_type: "short_answer",
            question_count: 5,
            marks_per_question: 2,
            total_marks: 10,
            order_index: 3,
          },
        ],
        isActive: true,
      }
    );
  } else {
    console.log("   ⚠ IT subject or Class 12 missing (skipping IT structures).");
  }

  // Scholarship Exam Structures (Class 8)
  // Use the scholarship category or individual subjects
  if (scholarshipCategory && class8) {
    // Paper I: Marathi + Mathematics
    if (scholarshipMarathi && scholarshipMath) {
      examStructuresData.push({
        subjectId: scholarshipCategory.id, // Use category for overall structure
        classLevelId: class8.id,
        nameEn: "Scholarship Class 8: Paper I",
        nameMr: "शिष्यवृत्ती इयत्ता ८: पेपर I",
        descriptionEn: "First Language (Marathi) and Mathematics",
        descriptionMr: "प्रथम भाषा (मराठी) आणि गणित",
        classLevel: "class_8",
        durationMinutes: 90,
        totalQuestions: 75,
        totalMarks: 150,
        passingPercentage: 40,
        isTemplate: true,
        sections: [
          {
            id: "s1",
            code: "lang",
            name_en: "First Language (Marathi)",
            name_mr: "प्रथम भाषा (मराठी)",
            question_type: "mcq_single",
            question_count: 25,
            marks_per_question: 2,
            total_marks: 50,
            order_index: 1,
          },
          {
            id: "s2",
            code: "math",
            name_en: "Mathematics",
            name_mr: "गणित",
            question_type: "mcq_single",
            question_count: 50,
            marks_per_question: 2,
            total_marks: 100,
            order_index: 2,
          }
        ],
        isActive: true,
      });
    }

    // Paper II: Intelligence Test + General Knowledge
    if (scholarshipIntelligence && scholarshipGK) {
      examStructuresData.push({
        subjectId: scholarshipCategory.id, // Use category for overall structure
        classLevelId: class8.id,
        nameEn: "Scholarship Class 8: Paper II",
        nameMr: "शिष्यवृत्ती इयत्ता ८: पेपर II",
        descriptionEn: "Intelligence Test and General Knowledge",
        descriptionMr: "बुद्धिमत्ता चाचणी आणि सामान्य ज्ञान",
        classLevel: "class_8",
        durationMinutes: 90,
        totalQuestions: 75,
        totalMarks: 150,
        passingPercentage: 40,
        isTemplate: true,
        sections: [
          {
            id: "s1",
            code: "iq",
            name_en: "Intelligence Test",
            name_mr: "बुद्धिमत्ता चाचणी",
            question_type: "mcq_single",
            question_count: 50,
            marks_per_question: 2,
            total_marks: 100,
            order_index: 1,
          },
          {
            id: "s2",
            code: "gk",
            name_en: "General Knowledge",
            name_mr: "सामान्य ज्ञान",
            question_type: "mcq_single",
            question_count: 25,
            marks_per_question: 2,
            total_marks: 50,
            order_index: 2,
          }
        ],
        isActive: true,
      });
    }

    // Quick Test Structure for Scholarship
    examStructuresData.push({
      subjectId: scholarshipCategory.id,
      classLevelId: class8.id,
      nameEn: "Scholarship Quick Test",
      nameMr: "शिष्यवृत्ती द्रुत चाचणी",
      descriptionEn: "Quick assessment test for Scholarship preparation",
      descriptionMr: "शिष्यवृत्ती तयारीसाठी द्रुत मूल्यांकन चाचणी",
      classLevel: "class_8",
      durationMinutes: 30,
      totalQuestions: 25,
      totalMarks: 50,
      passingPercentage: 40,
      isTemplate: true,
      sections: [
        {
          id: "s1",
          code: "quick",
          name_en: "Quick Assessment",
          name_mr: "द्रुत मूल्यांकन",
          question_type: "mcq_single",
          question_count: 25,
          marks_per_question: 2,
          total_marks: 50,
          order_index: 1,
        }
      ],
      isActive: true,
    });
  }

  // Find Class 11 for additional IT structures
  const class11 = allClassLevels.find((c) => c.slug === "class-11");
  
  // IT Exam Structures for Class 11
  if (itSubject && class11) {
    examStructuresData.push({
      subjectId: itSubject.id,
      classLevelId: class11.id,
      nameEn: "Class 11 IT Unit Test",
      nameMr: "अकरावी IT घटक चाचणी",
      descriptionEn: "Unit test for Class 11 IT",
      descriptionMr: "अकरावी IT साठी घटक चाचणी",
      classLevel: "class_11",
      durationMinutes: 45,
      totalQuestions: 20,
      totalMarks: 25,
      passingPercentage: 35,
      isTemplate: true,
      sections: [
        {
          id: "s1",
          code: "s1",
          name_en: "Fill in the Blanks",
          name_mr: "रिकाम्या जागा भरा",
          question_type: "fill_blank",
          question_count: 5,
          marks_per_question: 1,
          total_marks: 5,
          order_index: 1,
        },
        {
          id: "s2",
          code: "s2",
          name_en: "True/False",
          name_mr: "खरे की खोटे",
          question_type: "true_false",
          question_count: 5,
          marks_per_question: 1,
          total_marks: 5,
          order_index: 2,
        },
        {
          id: "s3",
          code: "s3",
          name_en: "MCQ",
          name_mr: "बहुपर्यायी",
          question_type: "mcq_single",
          question_count: 10,
          marks_per_question: 1.5,
          total_marks: 15,
          order_index: 3,
        },
      ],
      isActive: true,
    });
  }

  if (examStructuresData.length > 0) {
    try {
      const examStructures = await db
        .insert(schema.examStructures)
        .values(examStructuresData)
        .returning();

      console.log(`   ✓ Created ${examStructures.length} exam structures:`);
      examStructures.forEach((structure) => {
        console.log(`      - ${structure.nameEn} (${structure.totalMarks} marks)`);
      });
      console.log();
      return examStructures;
    } catch (error: any) {
      console.error(`   ❌ Error inserting exam structures: ${error.message}`);
      throw error;
    }
  } else {
    console.log("   ⚠️  No exam structures created (missing dependencies)\n");
  }

  return [];
}

// Run if executed directly (not when imported)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed/exam-structures.ts')) {
  seedExamStructures()
    .then(() => {
      console.log("✅ Exam structures seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding exam structures:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}
