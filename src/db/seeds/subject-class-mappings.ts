import { db, schema, client } from "./db";

/**
 * Seed Subject-Class Mappings
 * Maps subjects to class levels for proper access control
 * Creates mappings for Scholarship (Class 4, 5, 7, 8) and IT (Class 11, 12)
 */
export async function seedSubjectClassMappings() {
  console.log("🔗 Seeding subject-class mappings...");

  try {
    // Clear existing mappings
    await db.delete(schema.subjectClassMappings);
    console.log("   ✓ Cleared existing mappings");
  } catch (error: any) {
    console.warn(`   ⚠️  Could not clear mappings: ${error.message}, continuing...`);
  }

  // Get subjects and class levels
  const allSubjects = await db.select().from(schema.subjects);
  const allClassLevels = await db.select().from(schema.classLevels);

  // Find subjects
  const scholarshipCategory = allSubjects.find((s) => s.slug === "scholarship");
  const scholarshipSubSubjects = allSubjects.filter((s) => s.parentSubjectId === scholarshipCategory?.id);
  const itSubject = allSubjects.find((s) => s.slug === "information_technology");

  // Find class levels
  const class4 = allClassLevels.find((c) => c.slug === "class-4");
  const class5 = allClassLevels.find((c) => c.slug === "class-5");
  const class7 = allClassLevels.find((c) => c.slug === "class-7");
  const class8 = allClassLevels.find((c) => c.slug === "class-8");
  const class11 = allClassLevels.find((c) => c.slug === "class-11");
  const class12 = allClassLevels.find((c) => c.slug === "class-12");

  const mappings: { subjectId: string; classLevelId: string }[] = [];

  // ============================================
  // Scholarship -> Class 4, 5, 7, 8
  // We map both the category AND each sub-subject to these classes
  // ============================================
  const scholarshipClasses = [class4, class5, class7, class8].filter(Boolean);

  if (scholarshipCategory) {
    for (const cls of scholarshipClasses) {
      if (cls) {
        // Map the category itself
        mappings.push({ subjectId: scholarshipCategory.id, classLevelId: cls.id });

        // Map all sub-subjects (Marathi, Math, Intelligence, GK)
        for (const subSubject of scholarshipSubSubjects) {
          mappings.push({ subjectId: subSubject.id, classLevelId: cls.id });
        }
      }
    }
  }

  // ============================================
  // IT -> Class 11, 12
  // ============================================
  if (itSubject && class11) {
    mappings.push({ subjectId: itSubject.id, classLevelId: class11.id });
  }
  if (itSubject && class12) {
    mappings.push({ subjectId: itSubject.id, classLevelId: class12.id });
  }

  // Insert all mappings
  if (mappings.length > 0) {
    await db.insert(schema.subjectClassMappings).values(mappings);
  }

  console.log(`   ✓ Created ${mappings.length} subject-class mappings:`);
  console.log(`      - Scholarship (+ 4 sub-subjects) → Class 4, 5, 7, 8`);
  console.log(`      - IT → Class 11, 12`);
  console.log("");

  return mappings;
}

// Run if executed directly (not when imported)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed/subject-class-mappings.ts')) {
  seedSubjectClassMappings()
    .then(() => {
      console.log("✅ Subject-class mappings seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding subject-class mappings:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}
