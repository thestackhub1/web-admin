import { db, schema, client } from "./db";

export async function seedExamStructures() {
  console.log("📋 Seeding exam structures...");

  // Clear existing exam structures
  await db.delete(schema.examStructures);
  console.log("   ✓ Cleared existing exam structures");

  // Get subjects and class levels
  const allSubjects = await db.select().from(schema.subjects);
  const allClassLevels = await db.select().from(schema.classLevels);

  const itSubject = allSubjects.find((s) => s.slug === "information_technology");
  const scholarshipPaper1 = allSubjects.find((s) => s.slug === "scholarship-paper-1");
  const scholarshipPaper2 = allSubjects.find((s) => s.slug === "scholarship-paper-2");

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

  // Scholarship Paper I (Class 8)
  if (scholarshipPaper1 && class8) {
    examStructuresData.push({
      subjectId: scholarshipPaper1.id,
      classLevelId: class8.id,
      nameEn: "Scholarship Class 8: Paper I",
      nameMr: "शिष्यवृत्ती इयत्ता ८: पेपर I",
      descriptionEn: "First Language and Mathematics",
      descriptionMr: "प्रथम भाषा आणि गणित",
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

  // Scholarship Paper II (Class 8)
  if (scholarshipPaper2 && class8) {
    examStructuresData.push({
      subjectId: scholarshipPaper2.id,
      classLevelId: class8.id,
      nameEn: "Scholarship Class 8: Paper II",
      nameMr: "शिष्यवृत्ती इयत्ता ८: पेपर II",
      descriptionEn: "Third Language and Intelligence Test",
      descriptionMr: "तृतीय भाषा आणि बुद्धिमत्ता चाचणी",
      classLevel: "class_8",
      durationMinutes: 90,
      totalQuestions: 75,
      totalMarks: 150,
      passingPercentage: 40,
      isTemplate: true,
      sections: [
        {
          id: "s1",
          code: "lang3",
          name_en: "Third Language (English)",
          name_mr: "तृतीय भाषा (इंग्रजी)",
          question_type: "mcq_single",
          question_count: 25,
          marks_per_question: 2,
          total_marks: 50,
          order_index: 1,
        },
        {
          id: "s2",
          code: "iq",
          name_en: "Intelligence Test",
          name_mr: "बुद्धिमत्ता चाचणी",
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

  if (examStructuresData.length > 0) {
    const examStructures = await db
      .insert(schema.examStructures)
      .values(examStructuresData)
      .returning();

    console.log(`   ✓ Created ${examStructures.length} exam structures\n`);
    return examStructures;
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
