import { db, schema, client } from "./db";
import { isNotNull } from "drizzle-orm";

/**
 * Seed Subjects
 * Creates subject hierarchy with Scholarship category and IT subject
 * Properly handles parent-child relationships
 */
export async function seedSubjects() {
  console.log("📚 Seeding subjects...");

  // Clear existing subjects in correct order (children first, then parents)
  try {
    // First delete children (sub-subjects with parent_subject_id)
    await db.delete(schema.subjects).where(
      isNotNull(schema.subjects.parentSubjectId)
    );
    // Then delete parents/remaining
    await db.delete(schema.subjects);
    console.log("   ✓ Cleared existing subjects");
  } catch (error: any) {
    console.warn(`   ⚠️  Could not clear subjects: ${error.message}, continuing...`);
  }

  // ============================================
  // 1. Create Top-Level Subjects
  // ============================================

  // Scholarship - Category for Class 4, 5, 7, 8
  const scholarshipCategory = await db
    .insert(schema.subjects)
    .values({
      nameEn: "Scholarship",
      nameMr: "शिष्यवृत्ती",
      slug: "scholarship",
      descriptionEn: "Maharashtra Scholarship Exam (Pre-Upper Primary & Pre-Secondary) for Class 5 & 8",
      descriptionMr: "महाराष्ट्र शिष्यवृत्ती परीक्षा (पूर्व उच्च प्राथमिक व पूर्व माध्यमिक) इयत्ता ५ व ८ साठी",
      icon: "🏆",
      orderIndex: 0,
      isActive: true,
      isCategory: true, // This is a CATEGORY containing sub-subjects
      isPaper: false,
    })
    .returning();

  // Information Technology - Standalone Subject for Class 11, 12
  const itSubject = await db
    .insert(schema.subjects)
    .values({
      nameEn: "Information Technology",
      nameMr: "माहिती तंत्रज्ञान",
      slug: "information_technology",
      descriptionEn: "HSC Information Technology (IT) for Class 11 & 12 - Maharashtra Board",
      descriptionMr: "इयत्ता ११ व १२ साठी HSC माहिती तंत्रज्ञान (IT) - महाराष्ट्र बोर्ड",
      icon: "💻",
      orderIndex: 1,
      isActive: true,
      isCategory: false, // Standalone subject
      isPaper: false,
    })
    .returning();

  console.log(`   ✓ Created Scholarship (category)`);
  console.log(`   ✓ Created Information Technology (standalone)`);

  // ============================================
  // 2. Create Sub-Subjects for Scholarship
  // ============================================

  const scholarshipId = scholarshipCategory[0].id;

  const scholarshipSubSubjects = await db
    .insert(schema.subjects)
    .values([
      {
        parentSubjectId: scholarshipId,
        nameEn: "Marathi / First Language",
        nameMr: "मराठी / प्रथम भाषा",
        slug: "scholarship-marathi",
        descriptionEn: "Marathi language, grammar, and comprehension for Scholarship exam (Paper I)",
        descriptionMr: "शिष्यवृत्ती परीक्षेसाठी मराठी भाषा, व्याकरण आणि आकलन (पेपर I)",
        icon: "📝",
        orderIndex: 1,
        isActive: true,
        isCategory: false,
        isPaper: false,
      },
      {
        parentSubjectId: scholarshipId,
        nameEn: "Mathematics",
        nameMr: "गणित",
        slug: "scholarship-mathematics",
        descriptionEn: "Mathematics and numerical ability for Scholarship exam (Paper I)",
        descriptionMr: "शिष्यवृत्ती परीक्षेसाठी गणित आणि संख्यात्मक क्षमता (पेपर I)",
        icon: "🔢",
        orderIndex: 2,
        isActive: true,
        isCategory: false,
        isPaper: false,
      },
      {
        parentSubjectId: scholarshipId,
        nameEn: "Intelligence Test",
        nameMr: "बुद्धिमत्ता चाचणी",
        slug: "scholarship-intelligence-test",
        descriptionEn: "Mental ability, logical reasoning, and aptitude for Scholarship exam (Paper II)",
        descriptionMr: "शिष्यवृत्ती परीक्षेसाठी मानसिक क्षमता, तार्किक विचार आणि योग्यता (पेपर II)",
        icon: "🧠",
        orderIndex: 3,
        isActive: true,
        isCategory: false,
        isPaper: false,
      },
      {
        parentSubjectId: scholarshipId,
        nameEn: "General Knowledge",
        nameMr: "सामान्य ज्ञान",
        slug: "scholarship-general-knowledge",
        descriptionEn: "General knowledge, current affairs, science, and social studies for Scholarship exam (Paper II)",
        descriptionMr: "शिष्यवृत्ती परीक्षेसाठी सामान्य ज्ञान, चालू घडामोडी, विज्ञान आणि सामाजिक अभ्यास (पेपर II)",
        icon: "🌍",
        orderIndex: 4,
        isActive: true,
        isCategory: false,
        isPaper: false,
      },
    ])
    .returning();

  console.log(`   ✓ Created ${scholarshipSubSubjects.length} sub-subjects under Scholarship:`);
  console.log(`      - Marathi / First Language`);
  console.log(`      - Mathematics`);
  console.log(`      - Intelligence Test`);
  console.log(`      - General Knowledge`);
  console.log("");

  return {
    scholarship: scholarshipCategory[0],
    it: itSubject[0],
    scholarshipSubSubjects,
  };
}

// Run if executed directly (not when imported)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed/subjects.ts')) {
  seedSubjects()
    .then(() => {
      console.log("✅ Subjects seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding subjects:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}
