import { db, schema, client } from "./db";

/**
 * Seed Class Levels
 * Creates class levels for Scholarship (4, 5, 7, 8) and IT (11, 12)
 */
export async function seedClassLevels() {
  console.log("🎓 Seeding class levels...");

  try {
    // Clear existing class levels
    await db.delete(schema.classLevels);
    console.log("   ✓ Cleared existing class levels");
  } catch (error: any) {
    console.warn(`   ⚠️  Could not clear class levels: ${error.message}, continuing...`);
  }

  // Fresh start with Class 4, 5, 7, 8 (Scholarship) and 11, 12 (IT)
  const classLevels = await db
    .insert(schema.classLevels)
    .values([
      // Scholarship Classes (Pre-Upper Primary & Pre-Secondary)
      {
        nameEn: "Class 4",
        nameMr: "इयत्ता ४",
        slug: "class-4",
        descriptionEn: "Fourth standard - Pre-Upper Primary Scholarship preparation",
        descriptionMr: "इयत्ता चौथी - पूर्व उच्च प्राथमिक शिष्यवृत्ती तयारी",
        orderIndex: 1,
        isActive: true,
      },
      {
        nameEn: "Class 5",
        nameMr: "इयत्ता ५",
        slug: "class-5",
        descriptionEn: "Fifth standard - Pre-Upper Primary Scholarship exam",
        descriptionMr: "इयत्ता पाचवी - पूर्व उच्च प्राथमिक शिष्यवृत्ती परीक्षा",
        orderIndex: 2,
        isActive: true,
      },
      {
        nameEn: "Class 6",
        nameMr: "इयत्ता ६",
        slug: "class-6",
        descriptionEn: "Sixth standard",
        descriptionMr: "इयत्ता सहावी",
        orderIndex: 3,
        isActive: true,
      },
      {
        nameEn: "Class 7",
        nameMr: "इयत्ता ७",
        slug: "class-7",
        descriptionEn: "Seventh standard - Pre-Secondary Scholarship preparation",
        descriptionMr: "इयत्ता सातवी - पूर्व माध्यमिक शिष्यवृत्ती तयारी",
        orderIndex: 4,
        isActive: true,
      },
      {
        nameEn: "Class 8",
        nameMr: "इयत्ता ८",
        slug: "class-8",
        descriptionEn: "Eighth standard - Pre-Secondary Scholarship exam",
        descriptionMr: "इयत्ता आठवी - पूर्व माध्यमिक शिष्यवृत्ती परीक्षा",
        orderIndex: 5,
        isActive: true,
      },
      {
        nameEn: "Class 9",
        nameMr: "इयत्ता ९",
        slug: "class-9",
        descriptionEn: "Ninth standard",
        descriptionMr: "इयत्ता नववी",
        orderIndex: 6,
        isActive: true,
      },
      {
        nameEn: "Class 10",
        nameMr: "इयत्ता १०",
        slug: "class-10",
        descriptionEn: "Tenth standard",
        descriptionMr: "इयत्ता दहावी",
        orderIndex: 7,
        isActive: true,
      },
      // HSC Classes (IT Subject)
      {
        nameEn: "Class 11",
        nameMr: "इयत्ता ११",
        slug: "class-11",
        descriptionEn: "Eleventh standard - HSC IT (Information Technology)",
        descriptionMr: "इयत्ता अकरावी - HSC माहिती तंत्रज्ञान",
        orderIndex: 8,
        isActive: true,
      },
      {
        nameEn: "Class 12",
        nameMr: "इयत्ता १२",
        slug: "class-12",
        descriptionEn: "Twelfth standard - HSC IT (Information Technology)",
        descriptionMr: "इयत्ता बारावी - HSC माहिती तंत्रज्ञान",
        orderIndex: 9,
        isActive: true,
      },
    ])
    .returning();

  console.log(`   ✓ Created ${classLevels.length} class levels:`);
  console.log(`      - Class 4, 5, 7, 8 (for Scholarship)`);
  console.log(`      - Class 11, 12 (for IT)\n`);
  return classLevels;
}

// Run if executed directly (not when imported)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed/class-levels.ts')) {
  seedClassLevels()
    .then(() => {
      console.log("✅ Class levels seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding class levels:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}
