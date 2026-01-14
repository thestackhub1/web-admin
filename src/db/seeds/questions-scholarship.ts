import { db, schema, client } from "./db";

/**
 * Seed Scholarship questions (Marathi primary language)
 * These questions are for Class 8-10 scholarship exam preparation
 */

interface QuestionData {
  questionText: string;
  questionLanguage: "en" | "mr";
  questionTextSecondary?: string;
  secondaryLanguage?: "en" | "mr";
  questionType: string;
  difficulty: "easy" | "medium" | "hard";
  answerData: any;
  chapterId?: string;
  marks: number;
  explanationEn?: string;
  explanationMr?: string;
  tags?: string[];
  classLevel?: string;
}

/**
 * Get chapters for Scholarship subject (all sub-subjects)
 */
async function getScholarshipChapters() {
  const allSubjects = await db.select().from(schema.subjects);

  // Find all Scholarship sub-subjects
  const marathiSubject = allSubjects.find((s) => s.slug === "scholarship-marathi");
  const mathSubject = allSubjects.find((s) => s.slug === "scholarship-mathematics");
  const intelligenceSubject = allSubjects.find((s) => s.slug === "scholarship-intelligence-test");
  const gkSubject = allSubjects.find((s) => s.slug === "scholarship-general-knowledge");

  // If no sub-subjects found, check for the parent category
  const scholarshipCategory = allSubjects.find((s) => s.slug === "scholarship" && s.isCategory);

  if (!marathiSubject && !mathSubject && !intelligenceSubject && !gkSubject && !scholarshipCategory) {
    throw new Error("Scholarship subjects not found. Please seed subjects first.");
  }

  const subjectIds = [
    marathiSubject?.id,
    mathSubject?.id,
    intelligenceSubject?.id,
    gkSubject?.id,
  ].filter(Boolean) as string[];

  const allChapters = await db.select().from(schema.chapters);
  const chapters = allChapters.filter((c) => subjectIds.includes(c.subjectId));

  // Map chapter names (Marathi) to IDs for question seeding
  const chapterMap: Record<string, string> = {};
  if (chapters.length > 0) {
    for (const chapter of chapters) {
      const key = chapter.nameMr.toLowerCase().replace(/\s+/g, "_");
      chapterMap[key] = chapter.id;
      // Also add English-based keys for flexibility
      const keyEn = chapter.nameEn.toLowerCase().replace(/\s+/g, "_");
      chapterMap[keyEn] = chapter.id;
    }
    // Create aliases for legacy chapter references in question data
    // Geography
    if (chapterMap["geography"]) chapterMap["भूगोल"] = chapterMap["geography"];
    // History
    if (chapterMap["history"]) chapterMap["इतिहास"] = chapterMap["history"];
    // Science
    if (chapterMap["science_&_nature"]) chapterMap["विज्ञान"] = chapterMap["science_&_nature"];
    // Language/Marathi
    if (chapterMap["vocabulary_&_word_meanings"]) chapterMap["भाषा"] = chapterMap["vocabulary_&_word_meanings"];
    // General Knowledge
    if (chapterMap["current_affairs"]) chapterMap["सामान्य_ज्ञान"] = chapterMap["current_affairs"];
  }

  // Return the first sub-subject ID for legacy compatibility
  return {
    subjectId: marathiSubject?.id || mathSubject?.id || scholarshipCategory?.id,
    chapters: chapterMap
  };
}

/**
 * Fill in the Blanks Questions (10 questions) - Marathi
 */
function getFillBlankQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "महाराष्ट्राची राजधानी _____ आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["मुंबई", "Mumbai"] },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "मुंबई ही महाराष्ट्राची राजधानी आणि आर्थिक राजधानी आहे.",
      tags: ["भूगोल", "महाराष्ट्र"],
      classLevel: "8",
    },
    {
      questionText: "_____ हा संगणकाचा मेंदू मानला जातो.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["CPU", "सेंट्रल प्रोसेसिंग युनिट"] },
      chapterId: chapters.संगणक || undefined,
      marks: 1,
      explanationMr: "CPU (सेंट्रल प्रोसेसिंग युनिट) हा संगणकाचा मेंदू मानला जातो.",
      tags: ["संगणक", "CPU"],
      classLevel: "8",
    },
    {
      questionText: "भारताचे राष्ट्रगीत _____ यांनी लिहिले आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["रवींद्रनाथ टागोर", "Rabindranath Tagore"] },
      chapterId: chapters.इतिहास || undefined,
      marks: 1,
      explanationMr: "रवींद्रनाथ टागोर यांनी 'जन गण मन' हे राष्ट्रगीत लिहिले.",
      tags: ["इतिहास", "राष्ट्रगीत"],
      classLevel: "9",
    },
    {
      questionText: "सूर्याच्या सर्वात जवळ असलेला ग्रह _____ आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["बुध", "Mercury"] },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "बुध हा सूर्याच्या सर्वात जवळ असलेला ग्रह आहे.",
      tags: ["विज्ञान", "ग्रह"],
      classLevel: "8",
    },
    {
      questionText: "_____ हा सर्वात मोठा महासागर आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["पॅसिफिक", "Pacific", "प्रशांत महासागर"] },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "प्रशांत महासागर हा जगातील सर्वात मोठा महासागर आहे.",
      tags: ["भूगोल", "महासागर"],
      classLevel: "9",
    },
    {
      questionText: "पृथ्वीवर सर्वाधिक प्राणी कोणत्या वर्गात मोडतात? _____",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["कीटक", "insects", "Insecta"] },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "कीटक हा सर्वात मोठा प्राणी वर्ग आहे.",
      tags: ["विज्ञान", "जीवशास्त्र"],
      classLevel: "9",
    },
    {
      questionText: "भारताचा राष्ट्रीय पक्षी _____ आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["मोर", "Peacock", "पावसा"] },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "मोर हा भारताचा राष्ट्रीय पक्षी आहे.",
      tags: ["विज्ञान", "राष्ट्रीय चिन्हे"],
      classLevel: "8",
    },
    {
      questionText: "_____ हा सर्वात लहान महासागर आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["आर्क्टिक", "Arctic", "उत्तर ध्रुवीय महासागर"] },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "आर्क्टिक महासागर हा सर्वात लहान महासागर आहे.",
      tags: ["भूगोल"],
      classLevel: "9",
    },
    {
      questionText: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी _____ दिवस लागतात.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["365", "365.25", "एक वर्ष"] },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी 365.25 दिवस लागतात.",
      tags: ["विज्ञान", "पृथ्वी"],
      classLevel: "9",
    },
    {
      questionText: "भारताची राष्ट्रीय भाषा _____ आहे.",
      questionLanguage: "mr",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["हिंदी", "Hindi"] },
      chapterId: chapters.भाषा || undefined,
      marks: 1,
      explanationMr: "हिंदी ही भारताची राष्ट्रीय भाषा आहे.",
      tags: ["भाषा", "भारत"],
      classLevel: "8",
    },
  ];
}

/**
 * True/False Questions (10 questions) - Marathi
 */
function getTrueFalseQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "मुंबई ही महाराष्ट्राची राजधानी आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "मुंबई ही महाराष्ट्राची राजधानी आहे.",
      tags: ["भूगोल", "महाराष्ट्र"],
      classLevel: "8",
    },
    {
      questionText: "बुध हा सूर्याच्या सर्वात जवळ असलेला ग्रह आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "बुध हा सूर्याच्या सर्वात जवळ असलेला ग्रह आहे.",
      tags: ["विज्ञान", "ग्रह"],
      classLevel: "8",
    },
    {
      questionText: "भारताचा राष्ट्रीय पक्षी मोर आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "मोर हा भारताचा राष्ट्रीय पक्षी आहे.",
      tags: ["विज्ञान", "राष्ट्रीय चिन्हे"],
      classLevel: "8",
    },
    {
      questionText: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी 365 दिवस लागतात.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: false },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी 365.25 दिवस लागतात.",
      tags: ["विज्ञान", "पृथ्वी"],
      classLevel: "9",
    },
    {
      questionText: "प्रशांत महासागर हा जगातील सर्वात मोठा महासागर आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "प्रशांत महासागर हा जगातील सर्वात मोठा महासागर आहे.",
      tags: ["भूगोल"],
      classLevel: "9",
    },
    {
      questionText: "हिंदी ही भारताची एकमेव राष्ट्रीय भाषा आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: false },
      chapterId: chapters.भाषा || undefined,
      marks: 1,
      explanationMr: "हिंदी ही भारताची राष्ट्रीय भाषा आहे, परंतु भारतात 22 अधिकृत भाषा आहेत.",
      tags: ["भाषा", "भारत"],
      classLevel: "9",
    },
    {
      questionText: "कीटक हा सर्वात मोठा प्राणी वर्ग आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: true },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "कीटक हा सर्वात मोठा प्राणी वर्ग आहे.",
      tags: ["विज्ञान", "जीवशास्त्र"],
      classLevel: "9",
    },
    {
      questionText: "आर्क्टिक महासागर हा सर्वात लहान महासागर आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "आर्क्टिक महासागर हा सर्वात लहान महासागर आहे.",
      tags: ["भूगोल"],
      classLevel: "9",
    },
    {
      questionText: "रवींद्रनाथ टागोर यांनी भारताचे राष्ट्रगीत लिहिले आहे.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: true },
      chapterId: chapters.इतिहास || undefined,
      marks: 1,
      explanationMr: "रवींद्रनाथ टागोर यांनी 'जन गण मन' हे राष्ट्रगीत लिहिले.",
      tags: ["इतिहास", "राष्ट्रगीत"],
      classLevel: "9",
    },
    {
      questionText: "CPU हा संगणकाचा मेंदू मानला जातो.",
      questionLanguage: "mr",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.संगणक || undefined,
      marks: 1,
      explanationMr: "CPU (सेंट्रल प्रोसेसिंग युनिट) हा संगणकाचा मेंदू मानला जातो.",
      tags: ["संगणक", "CPU"],
      classLevel: "8",
    },
  ];
}

/**
 * MCQ Single Questions (10 questions) - Marathi
 */
function getMCQSingleQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "महाराष्ट्राची राजधानी कोणती?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["पुणे", "नागपूर", "मुंबई", "औरंगाबाद"],
        correct: 2,
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "मुंबई ही महाराष्ट्राची राजधानी आहे.",
      tags: ["भूगोल", "महाराष्ट्र"],
      classLevel: "8",
    },
    {
      questionText: "सूर्याच्या सर्वात जवळ असलेला ग्रह कोणता?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["शुक्र", "बुध", "पृथ्वी", "मंगळ"],
        correct: 1,
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "बुध हा सूर्याच्या सर्वात जवळ असलेला ग्रह आहे.",
      tags: ["विज्ञान", "ग्रह"],
      classLevel: "8",
    },
    {
      questionText: "भारताचा राष्ट्रीय पक्षी कोणता?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["कबूतर", "मोर", "हंस", "कोकीळ"],
        correct: 1,
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "मोर हा भारताचा राष्ट्रीय पक्षी आहे.",
      tags: ["विज्ञान", "राष्ट्रीय चिन्हे"],
      classLevel: "8",
    },
    {
      questionText: "जगातील सर्वात मोठा महासागर कोणता?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["अटलांटिक", "प्रशांत", "हिंदी", "आर्क्टिक"],
        correct: 1,
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "प्रशांत महासागर हा जगातील सर्वात मोठा महासागर आहे.",
      tags: ["भूगोल"],
      classLevel: "9",
    },
    {
      questionText: "भारताचे राष्ट्रगीत कोणी लिहिले?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "medium",
      answerData: {
        options: ["महात्मा गांधी", "रवींद्रनाथ टागोर", "जवाहरलाल नेहरू", "सुभाषचंद्र बोस"],
        correct: 1,
      },
      chapterId: chapters.इतिहास || undefined,
      marks: 1,
      explanationMr: "रवींद्रनाथ टागोर यांनी 'जन गण मन' हे राष्ट्रगीत लिहिले.",
      tags: ["इतिहास", "राष्ट्रगीत"],
      classLevel: "9",
    },
    {
      questionText: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी किती दिवस लागतात?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "medium",
      answerData: {
        options: ["360", "365", "365.25", "366"],
        correct: 2,
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी 365.25 दिवस लागतात.",
      tags: ["विज्ञान", "पृथ्वी"],
      classLevel: "9",
    },
    {
      questionText: "संगणकाचा मेंदू कोणता मानला जातो?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["RAM", "CPU", "Hard Disk", "Monitor"],
        correct: 1,
      },
      chapterId: chapters.संगणक || undefined,
      marks: 1,
      explanationMr: "CPU (सेंट्रल प्रोसेसिंग युनिट) हा संगणकाचा मेंदू मानला जातो.",
      tags: ["संगणक", "CPU"],
      classLevel: "8",
    },
    {
      questionText: "भारताची राष्ट्रीय भाषा कोणती?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["मराठी", "हिंदी", "इंग्रजी", "संस्कृत"],
        correct: 1,
      },
      chapterId: chapters.भाषा || undefined,
      marks: 1,
      explanationMr: "हिंदी ही भारताची राष्ट्रीय भाषा आहे.",
      tags: ["भाषा", "भारत"],
      classLevel: "8",
    },
    {
      questionText: "सर्वात लहान महासागर कोणता?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["अटलांटिक", "प्रशांत", "हिंदी", "आर्क्टिक"],
        correct: 3,
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 1,
      explanationMr: "आर्क्टिक महासागर हा सर्वात लहान महासागर आहे.",
      tags: ["भूगोल"],
      classLevel: "9",
    },
    {
      questionText: "सर्वात मोठा प्राणी वर्ग कोणता?",
      questionLanguage: "mr",
      questionType: "mcq_single",
      difficulty: "medium",
      answerData: {
        options: ["स्तनधारी", "पक्षी", "कीटक", "मासे"],
        correct: 2,
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 1,
      explanationMr: "कीटक हा सर्वात मोठा प्राणी वर्ग आहे.",
      tags: ["विज्ञान", "जीवशास्त्र"],
      classLevel: "9",
    },
  ];
}

/**
 * MCQ Two Questions (5 questions) - Two correct answers (Marathi)
 */
function getMCQTwoQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "खालीलपैकी कोणते दोन भारताचे राष्ट्रीय चिन्ह आहेत? (दोन निवडा)",
      questionLanguage: "mr",
      questionTextSecondary: "Which of the following are two national symbols of India? (Select two)",
      secondaryLanguage: "en",
      questionType: "mcq_two",
      difficulty: "medium",
      answerData: {
        options: ["मोर", "बाघ", "कबूतर", "हंस"],
        correct: [0, 1], // मोर (Peacock) and बाघ (Tiger)
      },
      chapterId: chapters.सामान्य_ज्ञान || undefined,
      marks: 2,
      explanationMr: "मोर हा भारताचा राष्ट्रीय पक्षी आहे आणि बाघ हा राष्ट्रीय प्राणी आहे.",
      tags: ["राष्ट्रीय चिन्हे", "भारत"],
      classLevel: "8",
    },
    {
      questionText: "खालीलपैकी कोणते दोन महाराष्ट्रातील प्रसिद्ध पर्यटनस्थळे आहेत? (दोन निवडा)",
      questionLanguage: "mr",
      questionTextSecondary: "Which of the following are two famous tourist places in Maharashtra? (Select two)",
      secondaryLanguage: "en",
      questionType: "mcq_two",
      difficulty: "easy",
      answerData: {
        options: ["ताजमहाल", "अजिंठा", "एलोरा", "गोल्डन टेम्पल"],
        correct: [1, 2], // अजिंठा and एलोरा
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 2,
      explanationMr: "अजिंठा आणि एलोरा ही महाराष्ट्रातील प्रसिद्ध गुहा आहेत.",
      tags: ["भूगोल", "महाराष्ट्र"],
      classLevel: "9",
    },
    {
      questionText: "खालीलपैकी कोणते दोन ग्रह आहेत? (दोन निवडा)",
      questionLanguage: "mr",
      questionTextSecondary: "Which of the following are two planets? (Select two)",
      secondaryLanguage: "en",
      questionType: "mcq_two",
      difficulty: "easy",
      answerData: {
        options: ["सूर्य", "चंद्र", "मंगळ", "शुक्र"],
        correct: [2, 3], // मंगळ and शुक्र
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 2,
      explanationMr: "मंगळ आणि शुक्र हे ग्रह आहेत, तर सूर्य हा तारा आहे आणि चंद्र हा उपग्रह आहे.",
      tags: ["विज्ञान", "ग्रह"],
      classLevel: "8",
    },
    {
      questionText: "खालीलपैकी कोणते दोन महासागर आहेत? (दोन निवडा)",
      questionLanguage: "mr",
      questionTextSecondary: "Which of the following are two oceans? (Select two)",
      secondaryLanguage: "en",
      questionType: "mcq_two",
      difficulty: "easy",
      answerData: {
        options: ["प्रशांत", "गंगा", "हिंदी", "अटलांटिक"],
        correct: [0, 3], // प्रशांत and अटलांटिक
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 2,
      explanationMr: "प्रशांत आणि अटलांटिक हे महासागर आहेत, तर गंगा आणि हिंदी हे नद्या आहेत.",
      tags: ["भूगोल", "महासागर"],
      classLevel: "9",
    },
    {
      questionText: "खालीलपैकी कोणते दोन भारतीय स्वतंत्रता सेनानी होते? (दोन निवडा)",
      questionLanguage: "mr",
      questionTextSecondary: "Which of the following are two Indian freedom fighters? (Select two)",
      secondaryLanguage: "en",
      questionType: "mcq_two",
      difficulty: "medium",
      answerData: {
        options: ["महात्मा गांधी", "नेपोलियन", "भगत सिंग", "जॉर्ज वॉशिंग्टन"],
        correct: [0, 2], // महात्मा गांधी and भगत सिंग
      },
      chapterId: chapters.इतिहास || undefined,
      marks: 2,
      explanationMr: "महात्मा गांधी आणि भगत सिंग हे भारतीय स्वतंत्रता सेनानी होते.",
      tags: ["इतिहास", "स्वतंत्रता"],
      classLevel: "9",
    },
  ];
}

/**
 * Short Answer Questions (5 questions) - Marathi
 */
function getShortAnswerQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "भारताची राजधानी कोणती आहे? एका वाक्यात सांगा.",
      questionLanguage: "mr",
      questionTextSecondary: "What is the capital of India? Answer in one sentence.",
      secondaryLanguage: "en",
      questionType: "short_answer",
      difficulty: "easy",
      answerData: {
        keywords: ["दिल्ली", "नवी दिल्ली", "राजधानी", "capital", "Delhi"],
        sampleAnswer: "भारताची राजधानी नवी दिल्ली आहे.",
      },
      chapterId: chapters.सामान्य_ज्ञान || undefined,
      marks: 2,
      explanationMr: "नवी दिल्ली ही भारताची राजधानी आहे.",
      tags: ["भूगोल", "भारत"],
      classLevel: "8",
    },
    {
      questionText: "सूर्यग्रहण कसे होते? थोडक्यात सांगा.",
      questionLanguage: "mr",
      questionTextSecondary: "How does a solar eclipse occur? Explain briefly.",
      secondaryLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["चंद्र", "सूर्य", "पृथ्वी", "छाया", "eclipse", "moon", "sun"],
        sampleAnswer: "जेव्हा चंद्र सूर्य आणि पृथ्वीच्या मध्ये येतो आणि सूर्यावर छाया पडते, तेव्हा सूर्यग्रहण होते.",
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 2,
      explanationMr: "सूर्यग्रहण तेव्हा होते जेव्हा चंद्र सूर्य आणि पृथ्वीच्या मध्ये येतो.",
      tags: ["विज्ञान", "खगोलशास्त्र"],
      classLevel: "9",
    },
    {
      questionText: "महाराष्ट्राची राजधानी कोणती आहे?",
      questionLanguage: "mr",
      questionTextSecondary: "What is the capital of Maharashtra?",
      secondaryLanguage: "en",
      questionType: "short_answer",
      difficulty: "easy",
      answerData: {
        keywords: ["मुंबई", "Mumbai", "राजधानी", "capital"],
        sampleAnswer: "महाराष्ट्राची राजधानी मुंबई आहे.",
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 2,
      explanationMr: "मुंबई ही महाराष्ट्राची राजधानी आहे.",
      tags: ["भूगोल", "महाराष्ट्र"],
      classLevel: "8",
    },
    {
      questionText: "भारताचे राष्ट्रगीत कोणी लिहिले?",
      questionLanguage: "mr",
      questionTextSecondary: "Who wrote India's national anthem?",
      secondaryLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["रवींद्रनाथ टागोर", "Tagore", "जन गण मन", "national anthem"],
        sampleAnswer: "भारताचे राष्ट्रगीत 'जन गण मन' रवींद्रनाथ टागोर यांनी लिहिले आहे.",
      },
      chapterId: chapters.इतिहास || undefined,
      marks: 2,
      explanationMr: "रवींद्रनाथ टागोर यांनी 'जन गण मन' हे राष्ट्रगीत लिहिले.",
      tags: ["इतिहास", "राष्ट्रगीत"],
      classLevel: "9",
    },
    {
      questionText: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी किती दिवस लागतात?",
      questionLanguage: "mr",
      questionTextSecondary: "How many days does it take for Earth to complete one revolution around the Sun?",
      secondaryLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["365", "365.25", "दिवस", "days", "प्रदक्षिणा", "revolution"],
        sampleAnswer: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी 365.25 दिवस लागतात.",
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 2,
      explanationMr: "पृथ्वीला सूर्याभोवती एक प्रदक्षिणा पूर्ण करण्यासाठी 365.25 दिवस लागतात, ज्याला एक वर्ष म्हणतात.",
      tags: ["विज्ञान", "पृथ्वी"],
      classLevel: "9",
    },
  ];
}

/**
 * Match Questions (5 questions) - Marathi
 */
function getMatchQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "खालील जुळवा:",
      questionLanguage: "mr",
      questionTextSecondary: "Match the following:",
      secondaryLanguage: "en",
      questionType: "match",
      difficulty: "easy",
      answerData: {
        pairs: [
          { left: "भारत", right: "नवी दिल्ली", left_en: "India", right_en: "New Delhi" },
          { left: "महाराष्ट्र", right: "मुंबई", left_en: "Maharashtra", right_en: "Mumbai" },
          { left: "गुजरात", right: "गांधीनगर", left_en: "Gujarat", right_en: "Gandhinagar" },
          { left: "कर्नाटक", right: "बंगळूर", left_en: "Karnataka", right_en: "Bangalore" },
        ],
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 2,
      explanationMr: "प्रत्येक राज्याची एक राजधानी असते.",
      tags: ["भूगोल", "राजधानी"],
      classLevel: "8",
    },
    {
      questionText: "खालील राष्ट्रीय चिन्हे जुळवा:",
      questionLanguage: "mr",
      questionTextSecondary: "Match the following national symbols:",
      secondaryLanguage: "en",
      questionType: "match",
      difficulty: "easy",
      answerData: {
        pairs: [
          { left: "राष्ट्रीय पक्षी", right: "मोर", left_en: "National Bird", right_en: "Peacock" },
          { left: "राष्ट्रीय प्राणी", right: "बाघ", left_en: "National Animal", right_en: "Tiger" },
          { left: "राष्ट्रीय फूल", right: "कमळ", left_en: "National Flower", right_en: "Lotus" },
          { left: "राष्ट्रीय फळ", right: "आंबा", left_en: "National Fruit", right_en: "Mango" },
        ],
      },
      chapterId: chapters.सामान्य_ज्ञान || undefined,
      marks: 2,
      explanationMr: "भारताची विविध राष्ट्रीय चिन्हे आहेत.",
      tags: ["राष्ट्रीय चिन्हे", "भारत"],
      classLevel: "8",
    },
    {
      questionText: "खालील ग्रह आणि त्यांचे वैशिष्ट्ये जुळवा:",
      questionLanguage: "mr",
      questionTextSecondary: "Match the following planets with their characteristics:",
      secondaryLanguage: "en",
      questionType: "match",
      difficulty: "medium",
      answerData: {
        pairs: [
          { left: "बुध", right: "सूर्याच्या सर्वात जवळ", left_en: "Mercury", right_en: "Closest to Sun" },
          { left: "शुक्र", right: "सर्वात गरम ग्रह", left_en: "Venus", right_en: "Hottest planet" },
          { left: "पृथ्वी", right: "जीवन असलेला ग्रह", left_en: "Earth", right_en: "Planet with life" },
          { left: "मंगळ", right: "लाल ग्रह", left_en: "Mars", right_en: "Red planet" },
        ],
      },
      chapterId: chapters.विज्ञान || undefined,
      marks: 2,
      explanationMr: "प्रत्येक ग्रहाची वेगळी वैशिष्ट्ये आहेत.",
      tags: ["विज्ञान", "ग्रह"],
      classLevel: "9",
    },
    {
      questionText: "खालील महासागर आणि त्यांचे वैशिष्ट्ये जुळवा:",
      questionLanguage: "mr",
      questionTextSecondary: "Match the following oceans with their characteristics:",
      secondaryLanguage: "en",
      questionType: "match",
      difficulty: "medium",
      answerData: {
        pairs: [
          { left: "प्रशांत", right: "सर्वात मोठा", left_en: "Pacific", right_en: "Largest" },
          { left: "अटलांटिक", right: "दुसरा मोठा", left_en: "Atlantic", right_en: "Second largest" },
          { left: "हिंदी", right: "तिसरा मोठा", left_en: "Indian", right_en: "Third largest" },
          { left: "आर्क्टिक", right: "सर्वात लहान", left_en: "Arctic", right_en: "Smallest" },
        ],
      },
      chapterId: chapters.भूगोल || undefined,
      marks: 2,
      explanationMr: "जगात चार महासागर आहेत, प्रत्येकाचे वेगळे वैशिष्ट्य आहे.",
      tags: ["भूगोल", "महासागर"],
      classLevel: "9",
    },
    {
      questionText: "खालील स्वतंत्रता सेनानी आणि त्यांचे योगदान जुळवा:",
      questionLanguage: "mr",
      questionTextSecondary: "Match the following freedom fighters with their contributions:",
      secondaryLanguage: "en",
      questionType: "match",
      difficulty: "medium",
      answerData: {
        pairs: [
          { left: "महात्मा गांधी", right: "अहिंसा आंदोलन", left_en: "Mahatma Gandhi", right_en: "Non-violence movement" },
          { left: "भगत सिंग", right: "क्रांतिकारक", left_en: "Bhagat Singh", right_en: "Revolutionary" },
          { left: "सुभाषचंद्र बोस", right: "आझाद हिंद फौज", left_en: "Subhash Chandra Bose", right_en: "Azad Hind Fauj" },
          { left: "जवाहरलाल नेहरू", right: "पहिले पंतप्रधान", left_en: "Jawaharlal Nehru", right_en: "First Prime Minister" },
        ],
      },
      chapterId: chapters.इतिहास || undefined,
      marks: 2,
      explanationMr: "प्रत्येक स्वतंत्रता सेनानीचे वेगळे योगदान होते.",
      tags: ["इतिहास", "स्वतंत्रता"],
      classLevel: "9",
    },
  ];
}

/**
 * Main seed function
 */
export async function seedScholarshipQuestions() {
  console.log("🏆 Seeding Scholarship questions (Marathi)...");

  try {
    // Get Scholarship subject and chapters
    const { chapters } = await getScholarshipChapters();

    // Clear existing scholarship questions
    await db.delete(schema.questionsScholarship);
    console.log("   ✓ Cleared existing Scholarship questions");

    // Get all questions
    const allQuestions = [
      ...getFillBlankQuestions(chapters),
      ...getTrueFalseQuestions(chapters),
      ...getMCQSingleQuestions(chapters),
      ...getMCQTwoQuestions(chapters),
      ...getShortAnswerQuestions(chapters),
      ...getMatchQuestions(chapters),
    ];

    // Insert questions
    const questions = await db
      .insert(schema.questionsScholarship)
      .values(allQuestions)
      .returning();

    console.log(`   ✓ Created ${questions.length} Scholarship questions`);
    console.log(`     - Fill in the Blanks: ${getFillBlankQuestions(chapters).length}`);
    console.log(`     - True/False: ${getTrueFalseQuestions(chapters).length}`);
    console.log(`     - MCQ Single: ${getMCQSingleQuestions(chapters).length}`);
    console.log(`     - MCQ Two: ${getMCQTwoQuestions(chapters).length}`);
    console.log(`     - Short Answer: ${getShortAnswerQuestions(chapters).length}`);
    console.log(`     - Match: ${getMatchQuestions(chapters).length}\n`);

    return questions;
  } catch (error) {
    console.error("   ❌ Error seeding Scholarship questions:", error);
    throw error;
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("/seed/questions-scholarship.ts")) {
  seedScholarshipQuestions()
    .then(() => {
      console.log("✅ Scholarship questions seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding Scholarship questions:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}

