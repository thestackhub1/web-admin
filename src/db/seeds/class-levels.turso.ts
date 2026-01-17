/**
 * Seed Class Levels - Turso/SQLite
 *
 * Seeds class level data for the exam platform.
 * Uses Turso-specific database connection and UUID generation.
 *
 * @module db/seeds/class-levels.turso
 */

import { db, schema, closeConnection } from "./db.turso";
import { generateId, nowISO } from "../utils";

export async function seedClassLevels() {
  console.log("🎓 Seeding class levels...");

  // Clear existing class levels
  await db.delete(schema.classLevels);
  console.log("   ✓ Cleared existing class levels");

  const now = nowISO();

  // Fresh start with Class 4, 5, 7, 8 (Scholarship) and 11, 12 (IT)
  const classLevels = await db
    .insert(schema.classLevels)
    .values([
      // Scholarship Classes (Pre-Upper Primary & Pre-Secondary)
      {
        id: generateId(),
        nameEn: "Class 4",
        nameMr: "इयत्ता ४",
        slug: "class-4",
        descriptionEn:
          "Fourth standard - Pre-Upper Primary Scholarship preparation",
        descriptionMr: "इयत्ता चौथी - पूर्व उच्च प्राथमिक शिष्यवृत्ती तयारी",
        orderIndex: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        nameEn: "Class 5",
        nameMr: "इयत्ता ५",
        slug: "class-5",
        descriptionEn: "Fifth standard - Pre-Upper Primary Scholarship exam",
        descriptionMr:
          "इयत्ता पाचवी - पूर्व उच्च प्राथमिक शिष्यवृत्ती परीक्षा",
        orderIndex: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        nameEn: "Class 7",
        nameMr: "इयत्ता ७",
        slug: "class-7",
        descriptionEn:
          "Seventh standard - Pre-Secondary Scholarship preparation",
        descriptionMr: "इयत्ता सातवी - पूर्व माध्यमिक शिष्यवृत्ती तयारी",
        orderIndex: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        nameEn: "Class 8",
        nameMr: "इयत्ता ८",
        slug: "class-8",
        descriptionEn: "Eighth standard - Pre-Secondary Scholarship exam",
        descriptionMr: "इयत्ता आठवी - पूर्व माध्यमिक शिष्यवृत्ती परीक्षा",
        orderIndex: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // HSC Classes (IT Subject)
      {
        id: generateId(),
        nameEn: "Class 11",
        nameMr: "इयत्ता ११",
        slug: "class-11",
        descriptionEn: "Eleventh standard - HSC IT (Information Technology)",
        descriptionMr: "इयत्ता अकरावी - HSC माहिती तंत्रज्ञान",
        orderIndex: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        nameEn: "Class 12",
        nameMr: "इयत्ता १२",
        slug: "class-12",
        descriptionEn: "Twelfth standard - HSC IT (Information Technology)",
        descriptionMr: "इयत्ता बारावी - HSC माहिती तंत्रज्ञान",
        orderIndex: 6,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  console.log(`   ✓ Created ${classLevels.length} class levels:`);
  console.log(`      - Class 4, 5, 7, 8 (for Scholarship)`);
  console.log(`      - Class 11, 12 (for IT)\n`);
  return classLevels;
}

// Run if executed directly
const isDirectExecution =
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").includes("class-levels");

if (isDirectExecution) {
  seedClassLevels()
    .then(() => {
      console.log("✅ Class levels seeding complete!");
      closeConnection();
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding class levels:", error);
      closeConnection();
      process.exit(1);
    });
}
