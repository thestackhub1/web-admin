import { db, schema, client } from "./db";

/**
 * Seed Information Technology questions (English primary language)
 * These questions are for Class 12 IT curriculum
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
 * Get chapters for IT subject
 */
async function getITChapters() {
  const allSubjects = await db.select().from(schema.subjects);
  const itSubject = allSubjects.find((s) => s.slug === "information_technology");

  if (!itSubject) {
    throw new Error("Information Technology subject not found. Please seed subjects first.");
  }

  const allChapters = await db.select().from(schema.chapters);
  const chapters = allChapters.filter((c) => c.subjectId === itSubject.id);

  const chapterMap: Record<string, string> = {};
  for (const chapter of chapters) {
    // Create multiple keys for flexibility
    const key1 = chapter.nameEn.toLowerCase().replace(/\s+/g, "_");
    const key2 = chapter.nameEn.toLowerCase().replace(/[^a-z0-9]/g, "_");
    chapterMap[key1] = chapter.id;
    chapterMap[key2] = chapter.id;

    // Also map by partial name match
    if (chapter.nameEn.toLowerCase().includes("web publishing")) {
      chapterMap["web_publishing"] = chapter.id;
    }
    if (chapter.nameEn.toLowerCase().includes("seo")) {
      chapterMap["introduction_to_seo"] = chapter.id;
    }
    if (chapter.nameEn.toLowerCase().includes("javascript")) {
      chapterMap["advanced_javascript"] = chapter.id;
    }
    if (chapter.nameEn.toLowerCase().includes("php")) {
      chapterMap["server_side_scripting_php"] = chapter.id;
    }
    if (chapter.nameEn.toLowerCase().includes("e-commerce") || chapter.nameEn.toLowerCase().includes("e-governance")) {
      chapterMap["e_commerce_and_e_governance"] = chapter.id;
    }
  }

  return { subjectId: itSubject.id, chapters: chapterMap };
}

/**
 * Fill in the Blanks Questions (10 questions)
 */
function getFillBlankQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "HTML stands for _____.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["HyperText Markup Language"] },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "HTML is the standard markup language for creating web pages.",
      tags: ["html", "web"],
      classLevel: "12",
    },
    {
      questionText: "CSS stands for _____.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["Cascading Style Sheets"] },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "CSS is used to style and layout web pages.",
      tags: ["css", "styling"],
      classLevel: "12",
    },
    {
      questionText: "SEO stands for _____.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["Search Engine Optimization"] },
      chapterId: chapters.introduction_to_seo,
      marks: 1,
      explanationEn: "SEO helps websites rank higher in search engine results.",
      tags: ["seo", "marketing"],
      classLevel: "12",
    },
    {
      questionText: "In JavaScript, _____ is used to declare a constant variable.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["const"] },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "The const keyword creates a read-only reference to a value.",
      tags: ["javascript", "variables"],
      classLevel: "12",
    },
    {
      questionText: "PHP originally stood for _____.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["Personal Home Page", "PHP: Hypertext Preprocessor"] },
      chapterId: chapters.server_side_scripting_php,
      marks: 1,
      explanationEn: "PHP is a server-side scripting language.",
      tags: ["php", "server"],
      classLevel: "12",
    },
    {
      questionText: "The _____ tag is used to create a hyperlink in HTML.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["<a>", "a", "anchor"] },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "The anchor tag <a> creates clickable links.",
      tags: ["html", "links"],
      classLevel: "12",
    },
    {
      questionText: "The _____ property in CSS is used to change the text color.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["color"] },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "The color property sets the text color.",
      tags: ["css", "styling"],
      classLevel: "12",
    },
    {
      questionText: "In PHP, variables are declared using the _____ symbol.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "easy",
      answerData: { blanks: ["$", "dollar"] },
      chapterId: chapters.server_side_scripting_php,
      marks: 1,
      explanationEn: "All PHP variables start with the $ symbol.",
      tags: ["php", "variables"],
      classLevel: "12",
    },
    {
      questionText: "The _____ method is used to add an element at the end of an array in JavaScript.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["push", "push()"] },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "The push() method adds elements to the end of an array.",
      tags: ["javascript", "arrays"],
      classLevel: "12",
    },
    {
      questionText: "The _____ loop in JavaScript executes at least once.",
      questionLanguage: "en",
      questionType: "fill_blank",
      difficulty: "medium",
      answerData: { blanks: ["do-while", "do while"] },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "The do-while loop checks the condition after execution.",
      tags: ["javascript", "loops"],
      classLevel: "12",
    },
  ];
}

/**
 * True/False Questions (10 questions)
 */
function getTrueFalseQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "HTML is a programming language.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: false },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "HTML is a markup language, not a programming language.",
      tags: ["html"],
      classLevel: "12",
    },
    {
      questionText: "JavaScript is a case-sensitive language.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: true },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "JavaScript distinguishes between uppercase and lowercase letters.",
      tags: ["javascript"],
      classLevel: "12",
    },
    {
      questionText: "PHP is a client-side scripting language.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: false },
      chapterId: chapters.server_side_scripting_php,
      marks: 1,
      explanationEn: "PHP is a server-side scripting language.",
      tags: ["php"],
      classLevel: "12",
    },
    {
      questionText: "CSS can be used to create animations on web pages.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: true },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "CSS animations allow creating motion effects.",
      tags: ["css", "animations"],
      classLevel: "12",
    },
    {
      questionText: "Keywords help in improving SEO ranking.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.introduction_to_seo,
      marks: 1,
      explanationEn: "Relevant keywords improve search engine visibility.",
      tags: ["seo"],
      classLevel: "12",
    },
    {
      questionText: "The 'let' keyword in JavaScript creates a block-scoped variable.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: true },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "let creates variables with block scope.",
      tags: ["javascript", "variables"],
      classLevel: "12",
    },
    {
      questionText: "MySQL is a NoSQL database.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: false },
      chapterId: chapters.server_side_scripting_php,
      marks: 1,
      explanationEn: "MySQL is a relational (SQL) database.",
      tags: ["database", "mysql"],
      classLevel: "12",
    },
    {
      questionText: "Meta tags are visible to users on the web page.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "medium",
      answerData: { correct: false },
      chapterId: chapters.introduction_to_seo,
      marks: 1,
      explanationEn: "Meta tags are not visible on the page but are used by search engines.",
      tags: ["seo", "html"],
      classLevel: "12",
    },
    {
      questionText: "The parseInt() function in JavaScript converts a string to an integer.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "parseInt() parses a string and returns an integer.",
      tags: ["javascript", "functions"],
      classLevel: "12",
    },
    {
      questionText: "E-commerce websites require server-side scripting.",
      questionLanguage: "en",
      questionType: "true_false",
      difficulty: "easy",
      answerData: { correct: true },
      chapterId: chapters.e_commerce_and_e_governance,
      marks: 1,
      explanationEn: "E-commerce sites need server-side processing for transactions.",
      tags: ["e-commerce"],
      classLevel: "12",
    },
  ];
}

/**
 * MCQ Single Questions (10 questions)
 */
function getMCQSingleQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "Which HTML tag is used to create a paragraph?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["<div>", "<span>", "<p>", "<br>"],
        correct: 2,
      },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "The <p> tag is used for paragraphs in HTML.",
      tags: ["html"],
      classLevel: "12",
    },
    {
      questionText: "Which keyword is used to declare a variable in JavaScript?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["var", "int", "dim", "define"],
        correct: 0,
      },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "var, let, and const are used to declare variables in JavaScript.",
      tags: ["javascript", "variables"],
      classLevel: "12",
    },
    {
      questionText: "What is the correct syntax to output 'Hello World' in PHP?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["echo 'Hello World';", "print('Hello World')", "console.log('Hello World');", "System.out.println('Hello World');"],
        correct: 0,
      },
      chapterId: chapters.server_side_scripting_php,
      marks: 1,
      explanationEn: "echo is the most common way to output in PHP.",
      tags: ["php"],
      classLevel: "12",
    },
    {
      questionText: "Which CSS property is used to change the background color?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["color", "bg-color", "background-color", "bgcolor"],
        correct: 2,
      },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "background-color sets the background color of an element.",
      tags: ["css"],
      classLevel: "12",
    },
    {
      questionText: "What does SEO stand for?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["Search Engine Optimization", "Search Engine Operation", "Site Engine Optimization", "Search Enabled Optimization"],
        correct: 0,
      },
      chapterId: chapters.introduction_to_seo,
      marks: 1,
      explanationEn: "SEO stands for Search Engine Optimization.",
      tags: ["seo"],
      classLevel: "12",
    },
    {
      questionText: "Which method is used to find the length of a string in JavaScript?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["size()", "length", "len()", "count()"],
        correct: 1,
      },
      chapterId: chapters.advanced_javascript,
      marks: 1,
      explanationEn: "The length property returns the length of a string.",
      tags: ["javascript", "strings"],
      classLevel: "12",
    },
    {
      questionText: "Which of the following is a valid PHP variable?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "medium",
      answerData: {
        options: ["$my_var", "my_var", "@my_var", "#my_var"],
        correct: 0,
      },
      chapterId: chapters.server_side_scripting_php,
      marks: 1,
      explanationEn: "PHP variables must start with a dollar sign $.",
      tags: ["php", "variables"],
      classLevel: "12",
    },
    {
      questionText: "Which port is commonly used for HTTP?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "medium",
      answerData: {
        options: ["21", "22", "80", "443"],
        correct: 2,
      },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "Port 80 is the default port for HTTP.",
      tags: ["networking"],
      classLevel: "12",
    },
    {
      questionText: "Which of the following is a search engine?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["Chrome", "Google", "Firefox", "Safari"],
        correct: 1,
      },
      chapterId: chapters.introduction_to_seo,
      marks: 1,
      explanationEn: "Google is a search engine, while others are web browsers.",
      tags: ["seo"],
      classLevel: "12",
    },
    {
      questionText: "Which HTML attribute specifies an alternate text for an image?",
      questionLanguage: "en",
      questionType: "mcq_single",
      difficulty: "easy",
      answerData: {
        options: ["title", "src", "alt", "href"],
        correct: 2,
      },
      chapterId: chapters.web_publishing,
      marks: 1,
      explanationEn: "The alt attribute provides alternative text for images.",
      tags: ["html", "accessibility"],
      classLevel: "12",
    },
  ];
}

/**
 * MCQ Two Questions (5 questions) - Two correct answers
 */
function getMCQTwoQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "Which of the following are server-side scripting languages? (Select two)",
      questionLanguage: "en",
      questionType: "mcq_two",
      difficulty: "medium",
      answerData: {
        options: ["JavaScript", "PHP", "HTML", "Python"],
        correct: [1, 3], // PHP and Python
      },
      chapterId: chapters.server_side_scripting_php,
      marks: 2,
      explanationEn: "PHP and Python are server-side scripting languages, while JavaScript (client-side) and HTML (markup) are not.",
      tags: ["server-side", "scripting"],
      classLevel: "12",
    },
    {
      questionText: "Which of the following are valid HTML5 semantic elements? (Select two)",
      questionLanguage: "en",
      questionType: "mcq_two",
      difficulty: "easy",
      answerData: {
        options: ["<div>", "<section>", "<span>", "<article>"],
        correct: [1, 3], // section and article
      },
      chapterId: chapters.web_publishing,
      marks: 2,
      explanationEn: "<section> and <article> are HTML5 semantic elements, while <div> and <span> are generic containers.",
      tags: ["html5", "semantic"],
      classLevel: "12",
    },
    {
      questionText: "Which of the following are JavaScript data types? (Select two)",
      questionLanguage: "en",
      questionType: "mcq_two",
      difficulty: "easy",
      answerData: {
        options: ["String", "Integer", "Boolean", "Float"],
        correct: [0, 2], // String and Boolean
      },
      chapterId: chapters.advanced_javascript,
      marks: 2,
      explanationEn: "JavaScript has String and Boolean as primitive types. Integer and Float are not separate types in JavaScript.",
      tags: ["javascript", "data-types"],
      classLevel: "12",
    },
    {
      questionText: "Which of the following are important for SEO? (Select two)",
      questionLanguage: "en",
      questionType: "mcq_two",
      difficulty: "medium",
      answerData: {
        options: ["Meta tags", "Image alt text", "Font color", "Page title"],
        correct: [0, 1], // Meta tags and alt text
      },
      chapterId: chapters.introduction_to_seo,
      marks: 2,
      explanationEn: "Meta tags and image alt text are crucial for SEO, helping search engines understand content.",
      tags: ["seo", "optimization"],
      classLevel: "12",
    },
    {
      questionText: "Which of the following are CSS positioning properties? (Select two)",
      questionLanguage: "en",
      questionType: "mcq_two",
      difficulty: "medium",
      answerData: {
        options: ["static", "relative", "color", "absolute"],
        correct: [1, 3], // relative and absolute
      },
      chapterId: chapters.web_publishing,
      marks: 2,
      explanationEn: "relative and absolute are CSS positioning values, while static is default and color is not a positioning property.",
      tags: ["css", "positioning"],
      classLevel: "12",
    },
  ];
}

/**
 * Short Answer Questions (5 questions)
 */
function getShortAnswerQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "Explain the difference between HTTP and HTTPS in one sentence.",
      questionLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["secure", "SSL", "TLS", "encryption", "protocol"],
        sampleAnswer: "HTTPS is the secure version of HTTP that uses SSL/TLS encryption to protect data transmission.",
      },
      chapterId: chapters.web_publishing,
      marks: 2,
      explanationEn: "HTTPS adds encryption layer to HTTP protocol for secure communication.",
      tags: ["http", "security"],
      classLevel: "12",
    },
    {
      questionText: "What is the purpose of the 'alt' attribute in HTML img tags?",
      questionLanguage: "en",
      questionType: "short_answer",
      difficulty: "easy",
      answerData: {
        keywords: ["alternative", "text", "accessibility", "screen reader", "description"],
        sampleAnswer: "The alt attribute provides alternative text for images, used by screen readers and when images fail to load.",
      },
      chapterId: chapters.web_publishing,
      marks: 2,
      explanationEn: "Alt text improves accessibility and provides fallback content for images.",
      tags: ["html", "accessibility"],
      classLevel: "12",
    },
    {
      questionText: "What is the difference between 'let' and 'var' in JavaScript?",
      questionLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["scope", "block", "function", "hoisting", "redeclaration"],
        sampleAnswer: "let has block scope and cannot be redeclared, while var has function scope and can be redeclared.",
      },
      chapterId: chapters.advanced_javascript,
      marks: 2,
      explanationEn: "let provides block-level scoping, preventing common bugs associated with var.",
      tags: ["javascript", "variables"],
      classLevel: "12",
    },
    {
      questionText: "What is the purpose of meta tags in SEO?",
      questionLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["search engines", "description", "keywords", "metadata", "ranking"],
        sampleAnswer: "Meta tags provide metadata about web pages to search engines, helping them understand and index content for better search rankings.",
      },
      chapterId: chapters.introduction_to_seo,
      marks: 2,
      explanationEn: "Meta tags help search engines understand page content and improve visibility.",
      tags: ["seo", "meta-tags"],
      classLevel: "12",
    },
    {
      questionText: "Explain what a database connection is in PHP.",
      questionLanguage: "en",
      questionType: "short_answer",
      difficulty: "medium",
      answerData: {
        keywords: ["database", "connection", "mysqli", "PDO", "server"],
        sampleAnswer: "A database connection in PHP is a link between the PHP script and a database server, allowing data retrieval and manipulation using extensions like MySQLi or PDO.",
      },
      chapterId: chapters.server_side_scripting_php,
      marks: 2,
      explanationEn: "Database connections enable PHP scripts to interact with databases for data operations.",
      tags: ["php", "database"],
      classLevel: "12",
    },
  ];
}

/**
 * Match Questions (5 questions)
 */
function getMatchQuestions(chapters: Record<string, string>): QuestionData[] {
  return [
    {
      questionText: "Match the following HTML tags with their purposes:",
      questionLanguage: "en",
      questionType: "match",
      difficulty: "easy",
      answerData: {
        pairs: [
          { left: "<p>", right: "Paragraph", left_en: "<p>", right_en: "Paragraph" },
          { left: "<a>", right: "Link", left_en: "<a>", right_en: "Link" },
          { left: "<img>", right: "Image", left_en: "<img>", right_en: "Image" },
          { left: "<table>", right: "Table", left_en: "<table>", right_en: "Table" },
        ],
      },
      chapterId: chapters.web_publishing,
      marks: 2,
      explanationEn: "Each HTML tag has a specific semantic purpose in web development.",
      tags: ["html", "tags"],
      classLevel: "12",
    },
    {
      questionText: "Match the following JavaScript methods with their functions:",
      questionLanguage: "en",
      questionType: "match",
      difficulty: "medium",
      answerData: {
        pairs: [
          { left: "parseInt()", right: "Converts string to integer", left_en: "parseInt()", right_en: "Converts string to integer" },
          { left: "toString()", right: "Converts to string", left_en: "toString()", right_en: "Converts to string" },
          { left: "split()", right: "Splits string into array", left_en: "split()", right_en: "Splits string into array" },
          { left: "join()", right: "Joins array into string", left_en: "join()", right_en: "Joins array into string" },
        ],
      },
      chapterId: chapters.advanced_javascript,
      marks: 2,
      explanationEn: "JavaScript provides various methods for type conversion and string/array manipulation.",
      tags: ["javascript", "methods"],
      classLevel: "12",
    },
    {
      questionText: "Match the following CSS properties with their purposes:",
      questionLanguage: "en",
      questionType: "match",
      difficulty: "easy",
      answerData: {
        pairs: [
          { left: "color", right: "Text color", left_en: "color", right_en: "Text color" },
          { left: "background-color", right: "Background color", left_en: "background-color", right_en: "Background color" },
          { left: "font-size", right: "Text size", left_en: "font-size", right_en: "Text size" },
          { left: "margin", right: "Outer spacing", left_en: "margin", right_en: "Outer spacing" },
        ],
      },
      chapterId: chapters.web_publishing,
      marks: 2,
      explanationEn: "CSS properties control various visual aspects of HTML elements.",
      tags: ["css", "styling"],
      classLevel: "12",
    },
    {
      questionText: "Match the following PHP functions with their purposes:",
      questionLanguage: "en",
      questionType: "match",
      difficulty: "medium",
      answerData: {
        pairs: [
          { left: "echo", right: "Output text", left_en: "echo", right_en: "Output text" },
          { left: "mysqli_connect()", right: "Connect to database", left_en: "mysqli_connect()", right_en: "Connect to database" },
          { left: "isset()", right: "Check if variable exists", left_en: "isset()", right_en: "Check if variable exists" },
          { left: "count()", right: "Count array elements", left_en: "count()", right_en: "Count array elements" },
        ],
      },
      chapterId: chapters.server_side_scripting_php,
      marks: 2,
      explanationEn: "PHP provides built-in functions for common operations like output, database connections, and array manipulation.",
      tags: ["php", "functions"],
      classLevel: "12",
    },
    {
      questionText: "Match the following SEO terms with their descriptions:",
      questionLanguage: "en",
      questionType: "match",
      difficulty: "medium",
      answerData: {
        pairs: [
          { left: "Keywords", right: "Search terms users enter", left_en: "Keywords", right_en: "Search terms users enter" },
          { left: "Meta description", right: "Page summary for search results", left_en: "Meta description", right_en: "Page summary for search results" },
          { left: "Backlinks", right: "Links from other sites", left_en: "Backlinks", right_en: "Links from other sites" },
          { left: "Sitemap", right: "Site structure guide", left_en: "Sitemap", right_en: "Site structure guide" },
        ],
      },
      chapterId: chapters.introduction_to_seo,
      marks: 2,
      explanationEn: "SEO involves various techniques and terms for improving search engine visibility.",
      tags: ["seo", "terminology"],
      classLevel: "12",
    },
  ];
}

/**
 * Main seed function
 */
export async function seedITQuestions() {
  console.log("💻 Seeding Information Technology questions (English)...");

  try {
    // Get IT subject and chapters
    const { chapters } = await getITChapters();

    if (Object.keys(chapters).length === 0) {
      console.log("   ⚠ No chapters found for IT. Please seed chapters first.");
      return [];
    }

    // Clear existing IT questions
    await db.delete(schema.questionsInformationTechnology);
    console.log("   ✓ Cleared existing IT questions");

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
      .insert(schema.questionsInformationTechnology)
      .values(allQuestions)
      .returning();

    console.log(`   ✓ Created ${questions.length} IT questions`);
    console.log(`     - Fill in the Blanks: ${getFillBlankQuestions(chapters).length}`);
    console.log(`     - True/False: ${getTrueFalseQuestions(chapters).length}`);
    console.log(`     - MCQ Single: ${getMCQSingleQuestions(chapters).length}`);
    console.log(`     - MCQ Two: ${getMCQTwoQuestions(chapters).length}`);
    console.log(`     - Short Answer: ${getShortAnswerQuestions(chapters).length}`);
    console.log(`     - Match: ${getMatchQuestions(chapters).length}\n`);

    return questions;
  } catch (error) {
    console.error("   ❌ Error seeding IT questions:", error);
    throw error;
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("/seed/questions-it.ts")) {
  seedITQuestions()
    .then(() => {
      console.log("✅ IT questions seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding IT questions:", error);
      process.exit(1);
    })
    .finally(() => client.end());
}

