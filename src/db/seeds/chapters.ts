import { db, schema, client } from "./db";
import { randomUUID } from "crypto";

export async function seedChapters() {
  console.log("📖 Seeding chapters...");

  // Clear existing chapters
  await db.delete(schema.chapters);
  console.log("   ✓ Cleared existing chapters");

  // Get subjects
  const allSubjects = await db.select().from(schema.subjects);

  // Find IT subject
  const itSubject = allSubjects.find((s) => s.slug === "information_technology");

  // Find Scholarship sub-subjects
  const marathiSubject = allSubjects.find((s) => s.slug === "scholarship-marathi");
  const mathSubject = allSubjects.find((s) => s.slug === "scholarship-mathematics");
  const intelligenceSubject = allSubjects.find((s) => s.slug === "scholarship-intelligence-test");
  const gkSubject = allSubjects.find((s) => s.slug === "scholarship-general-knowledge");

  const now = new Date().toISOString();
  const chaptersData: (typeof schema.chapters.$inferInsert)[] = [];

  // ============================================
  // IT Chapters (Class 11 & 12)
  // ============================================
  if (itSubject) {
    chaptersData.push(
      // Class 11 chapters
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Computer Basics",
        nameMr: "संगणक मूलभूत",
        descriptionEn: "Introduction to computers and computing fundamentals",
        descriptionMr: "संगणक आणि संगणकीय मूलभूत गोष्टींचा परिचय",
        orderIndex: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Hardware Components",
        nameMr: "हार्डवेअर घटक",
        descriptionEn: "CPU, Memory, Storage, Input/Output devices",
        descriptionMr: "CPU, मेमरी, स्टोरेज, इनपुट/आउटपुट उपकरणे",
        orderIndex: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Software & Applications",
        nameMr: "सॉफ्टवेअर आणि ऍप्लिकेशन्स",
        descriptionEn: "Operating systems, applications, and software types",
        descriptionMr: "ऑपरेटिंग सिस्टम, अॅप्लिकेशन्स आणि सॉफ्टवेअर प्रकार",
        orderIndex: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Web Technologies",
        nameMr: "वेब तंत्रज्ञान",
        descriptionEn: "HTML, CSS basics for web development",
        descriptionMr: "वेब डेव्हलपमेंटसाठी HTML, CSS मूलभूत",
        orderIndex: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Class 12 chapters
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Web Publishing",
        nameMr: "वेब प्रकाशन",
        descriptionEn: "Creating and publishing websites, HTML/CSS advanced concepts",
        descriptionMr: "वेबसाइट तयार करणे आणि प्रकाशित करणे, HTML/CSS प्रगत संकल्पना",
        orderIndex: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Introduction to SEO",
        nameMr: "SEO चा परिचय",
        descriptionEn: "Search Engine Optimization fundamentals",
        descriptionMr: "सर्च इंजिन ऑप्टिमायझेशन मूलभूत",
        orderIndex: 6,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Advanced JavaScript",
        nameMr: "प्रगत JavaScript",
        descriptionEn: "DOM manipulation, events, AJAX, ES6+ features",
        descriptionMr: "DOM हाताळणी, इव्हेंट्स, AJAX, ES6+ वैशिष्ट्ये",
        orderIndex: 7,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: itSubject.id,
        nameEn: "Server Side Scripting (PHP)",
        nameMr: "सर्व्हर साइड स्क्रिप्टिंग (PHP)",
        descriptionEn: "PHP basics, forms handling, database connectivity",
        descriptionMr: "PHP मूलभूत, फॉर्म हाताळणी, डेटाबेस कनेक्टिव्हिटी",
        orderIndex: 8,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
    console.log("   ✓ IT chapters added");
  } else {
    console.log("   ⚠ IT subject not found (skipping IT chapters)");
  }

  // ============================================
  // Marathi / First Language Chapters
  // ============================================
  if (marathiSubject) {
    chaptersData.push(
      {
        id: randomUUID(),
        subjectId: marathiSubject.id,
        nameEn: "Vocabulary & Word Meanings",
        nameMr: "शब्दसंग्रह आणि शब्दार्थ",
        descriptionEn: "Synonyms, antonyms, word meanings",
        descriptionMr: "समानार्थी, विरुद्धार्थी, शब्दार्थ",
        orderIndex: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: marathiSubject.id,
        nameEn: "Grammar & Sentence Structure",
        nameMr: "व्याकरण आणि वाक्यरचना",
        descriptionEn: "Parts of speech, sentences, tenses",
        descriptionMr: "शब्दांचे प्रकार, वाक्ये, काळ",
        orderIndex: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: marathiSubject.id,
        nameEn: "Proverbs & Idioms",
        nameMr: "म्हणी आणि वाक्प्रचार",
        descriptionEn: "Common Marathi proverbs and idioms",
        descriptionMr: "सामान्य मराठी म्हणी आणि वाक्प्रचार",
        orderIndex: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: marathiSubject.id,
        nameEn: "Reading Comprehension",
        nameMr: "आकलन उतारा",
        descriptionEn: "Passage reading and understanding",
        descriptionMr: "उतारा वाचन आणि समजून घेणे",
        orderIndex: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
    console.log("   ✓ Marathi chapters added");
  }

  // ============================================
  // Mathematics Chapters
  // ============================================
  if (mathSubject) {
    chaptersData.push(
      {
        id: randomUUID(),
        subjectId: mathSubject.id,
        nameEn: "Number System",
        nameMr: "संख्या पद्धती",
        descriptionEn: "Natural numbers, integers, fractions, decimals",
        descriptionMr: "नैसर्गिक संख्या, पूर्णांक, अपूर्णांक, दशांश",
        orderIndex: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: mathSubject.id,
        nameEn: "Arithmetic Operations",
        nameMr: "गणितीय क्रिया",
        descriptionEn: "Addition, subtraction, multiplication, division",
        descriptionMr: "बेरीज, वजाबाकी, गुणाकार, भागाकार",
        orderIndex: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: mathSubject.id,
        nameEn: "Fractions & Decimals",
        nameMr: "अपूर्णांक आणि दशांश",
        descriptionEn: "Operations with fractions and decimal numbers",
        descriptionMr: "अपूर्णांक आणि दशांश संख्यांसह गणितीय क्रिया",
        orderIndex: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: mathSubject.id,
        nameEn: "Geometry",
        nameMr: "भूमिती",
        descriptionEn: "Shapes, angles, area, perimeter",
        descriptionMr: "आकार, कोन, क्षेत्रफळ, परिमिती",
        orderIndex: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: mathSubject.id,
        nameEn: "Algebra Basics",
        nameMr: "बीजगणित मूलभूत",
        descriptionEn: "Variables, expressions, simple equations",
        descriptionMr: "चल, राशी, साधी समीकरणे",
        orderIndex: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: mathSubject.id,
        nameEn: "Mensuration",
        nameMr: "क्षेत्रमिती",
        descriptionEn: "Area, volume, surface area calculations",
        descriptionMr: "क्षेत्रफळ, घनफळ, पृष्ठभाग क्षेत्रफळ गणना",
        orderIndex: 6,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
    console.log("   ✓ Mathematics chapters added");
  }

  // ============================================
  // Intelligence Test Chapters
  // ============================================
  if (intelligenceSubject) {
    chaptersData.push(
      {
        id: randomUUID(),
        subjectId: intelligenceSubject.id,
        nameEn: "Pattern Recognition",
        nameMr: "नमुना ओळख",
        descriptionEn: "Series, sequences, and pattern completion",
        descriptionMr: "मालिका, श्रेणी आणि नमुना पूर्णता",
        orderIndex: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: intelligenceSubject.id,
        nameEn: "Logical Reasoning",
        nameMr: "तार्किक विचार",
        descriptionEn: "Deductive and inductive reasoning",
        descriptionMr: "निगमनात्मक आणि आगमनात्मक तर्क",
        orderIndex: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: intelligenceSubject.id,
        nameEn: "Coding & Decoding",
        nameMr: "सांकेतिक भाषा",
        descriptionEn: "Letter, number, and symbol coding",
        descriptionMr: "अक्षर, संख्या आणि चिन्ह सांकेतीकरण",
        orderIndex: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: intelligenceSubject.id,
        nameEn: "Analogy & Classification",
        nameMr: "सादृश्यता आणि वर्गीकरण",
        descriptionEn: "Finding relationships and grouping",
        descriptionMr: "संबंध शोधणे आणि गटबद्ध करणे",
        orderIndex: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: intelligenceSubject.id,
        nameEn: "Figure & Mirror Images",
        nameMr: "आकृती आणि प्रतिमा",
        descriptionEn: "Spatial reasoning and visualization",
        descriptionMr: "अवकाशीय तर्क आणि दृश्यीकरण",
        orderIndex: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
    console.log("   ✓ Intelligence Test chapters added");
  }

  // ============================================
  // General Knowledge Chapters
  // ============================================
  if (gkSubject) {
    chaptersData.push(
      {
        id: randomUUID(),
        subjectId: gkSubject.id,
        nameEn: "Science & Nature",
        nameMr: "विज्ञान आणि निसर्ग",
        descriptionEn: "Basic science, plants, animals, environment",
        descriptionMr: "मूलभूत विज्ञान, वनस्पती, प्राणी, पर्यावरण",
        orderIndex: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: gkSubject.id,
        nameEn: "History",
        nameMr: "इतिहास",
        descriptionEn: "Indian history, freedom struggle, important events",
        descriptionMr: "भारतीय इतिहास, स्वातंत्र्य लढा, महत्त्वाच्या घटना",
        orderIndex: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: gkSubject.id,
        nameEn: "Geography",
        nameMr: "भूगोल",
        descriptionEn: "India geography, states, capitals, rivers",
        descriptionMr: "भारत भूगोल, राज्ये, राजधान्या, नद्या",
        orderIndex: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: gkSubject.id,
        nameEn: "Civics & Constitution",
        nameMr: "नागरिकशास्त्र आणि संविधान",
        descriptionEn: "Indian constitution, rights, duties, government",
        descriptionMr: "भारतीय संविधान, हक्क, कर्तव्ये, सरकार",
        orderIndex: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        subjectId: gkSubject.id,
        nameEn: "Current Affairs",
        nameMr: "चालू घडामोडी",
        descriptionEn: "Recent events, awards, sports, technology",
        descriptionMr: "अलीकडील घटना, पुरस्कार, क्रीडा, तंत्रज्ञान",
        orderIndex: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    );
    console.log("   ✓ General Knowledge chapters added");
  }

  // Insert all chapters
  if (chaptersData.length > 0) {
    const chapters = await db
      .insert(schema.chapters)
      .values(chaptersData)
      .returning();
    console.log(`\n   ✓ Created ${chapters.length} chapters total\n`);
    return chapters;
  }

  console.log("   ⚠ No chapters created (subjects not found)\n");
  return [];
}

// Run if executed directly (not when imported)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed/chapters.ts')) {
  seedChapters()
    .then(() => {
      console.log("✅ Chapters seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding chapters:", error);
      process.exit(1);
    })
    .finally(() => client.close());
}
