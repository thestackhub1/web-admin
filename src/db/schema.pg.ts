import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  numeric,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// Profiles
// ============================================
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  schoolId: uuid("school_id"), // Foreign key reference defined in migration SQL
  classLevel: text("class_level"),
  role: text("role").notNull().default("student"),
  permissions: jsonb("permissions").default({}),
  preferredLanguage: text("preferred_language").default("en"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// Schools
// ============================================
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameSearch: text("name_search").notNull(), // Lowercase, normalized for search
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationCountry: text("location_country").default("India"),
  address: text("address"), // Full address from CSV
  type: text("type"), // Government, Private, Shikshan Sanstha, etc.
  level: text("level"), // Primary, Secondary, College, CBSE/K-12, etc.
  foundedYear: text("founded_year"), // Can be year or "Historical"
  isVerified: boolean("is_verified").default(false),
  isUserAdded: boolean("is_user_added").default(false), // Flag for moderation queue
  createdBy: uuid("created_by"), // Foreign key to profiles.id, defined in migration SQL
  studentCount: integer("student_count").default(0), // Cache for analytics
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [schools.createdBy],
    references: [profiles.id],
  }),
  students: many(profiles),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  school: one(schools, {
    fields: [profiles.schoolId],
    references: [schools.id],
  }),
  questionsScholarship: many(questionsScholarship),
  questionsEnglish: many(questionsEnglish),
  questionsInformationTechnology: many(questionsInformationTechnology),
  exams: many(exams),
  createdSchools: many(schools),
}));

// ============================================
// Subjects (Recursive Hierarchy)
// ============================================
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentSubjectId: uuid("parent_subject_id"), // Self-reference for sub-subjects
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  slug: text("slug").unique().notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  icon: text("icon"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  isCategory: boolean("is_category").default(false), // Distinguishes "Scholarship" category from "IT" subject
  isPaper: boolean("is_paper").default(false),
  paperNumber: text("paper_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    parentReference: {
      columns: [table.parentSubjectId],
      foreignColumns: [table.id],
    },
  };
});

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  parentSubject: one(subjects, {
    fields: [subjects.parentSubjectId],
    references: [subjects.id],
    relationName: "paret_child_subjects",
  }),
  subSubjects: many(subjects, {
    relationName: "paret_child_subjects",
  }),
  chapters: many(chapters),
  examStructures: many(examStructures),
  exams: many(exams),
  subjectClassMappings: many(subjectClassMappings),
  scheduledExams: many(scheduledExams),
}));

// ============================================
// Class Levels
// ============================================
export const classLevels = pgTable("class_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  slug: text("slug").unique().notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const classLevelsRelations = relations(classLevels, ({ many }) => ({
  subjectClassMappings: many(subjectClassMappings),
  scheduledExams: many(scheduledExams),
  examStructures: many(examStructures),
}));

// ============================================
// Subject-Class Mappings
// ============================================
export const subjectClassMappings = pgTable("subject_class_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  classLevelId: uuid("class_level_id")
    .notNull()
    .references(() => classLevels.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const subjectClassMappingsRelations = relations(subjectClassMappings, ({ one }) => ({
  subject: one(subjects, {
    fields: [subjectClassMappings.subjectId],
    references: [subjects.id],
  }),
  classLevel: one(classLevels, {
    fields: [subjectClassMappings.classLevelId],
    references: [classLevels.id],
  }),
}));

// ============================================
// Chapters
// ============================================
export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  orderIndex: integer("order_index").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
  questionsScholarship: many(questionsScholarship),
  questionsEnglish: many(questionsEnglish),
  questionsInformationTechnology: many(questionsInformationTechnology),
}));

// ============================================
// Question Types Enum
// ============================================
export const questionTypes = [
  "fill_blank",
  "true_false",
  "mcq_single",
  "mcq_two",
  "mcq_three",
  "match",
  "short_answer",
  "long_answer",
  "programming",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const difficulties = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof difficulties)[number];

// ============================================
// Questions - Scholarship
// ============================================
export const questionsScholarship = pgTable("questions_scholarship", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionText: text("question_text").notNull(),
  questionLanguage: text("question_language").notNull().default("mr"), // Default Marathi, supports multiple languages
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  answerData: jsonb("answer_data").notNull(),
  explanation: text("explanation"), // Single explanation field (language matches questionLanguage)
  tags: text("tags").array().default([]),
  classLevel: text("class_level").notNull(), // Required for better readability
  marks: integer("marks").default(1),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const questionsScholarshipRelations = relations(questionsScholarship, ({ one }) => ({
  chapter: one(chapters, {
    fields: [questionsScholarship.chapterId],
    references: [chapters.id],
  }),
  creator: one(profiles, {
    fields: [questionsScholarship.createdBy],
    references: [profiles.id],
  }),
}));

// ============================================
// Questions - English
// ============================================
export const questionsEnglish = pgTable("questions_english", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionText: text("question_text").notNull(),
  questionLanguage: text("question_language").notNull().default("en"), // Always English
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  answerData: jsonb("answer_data").notNull(),
  explanation: text("explanation"), // Single explanation field (language matches questionLanguage)
  tags: text("tags").array().default([]),
  classLevel: text("class_level").notNull(), // Required for better readability
  marks: integer("marks").default(1),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const questionsEnglishRelations = relations(questionsEnglish, ({ one }) => ({
  chapter: one(chapters, {
    fields: [questionsEnglish.chapterId],
    references: [chapters.id],
  }),
  creator: one(profiles, {
    fields: [questionsEnglish.createdBy],
    references: [profiles.id],
  }),
}));

// ============================================
// Questions - Information Technology
// ============================================
export const questionsInformationTechnology = pgTable("questions_information_technology", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionText: text("question_text").notNull(),
  questionLanguage: text("question_language").notNull().default("en"), // Always English
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  answerData: jsonb("answer_data").notNull(),
  explanation: text("explanation"), // Single explanation field (language matches questionLanguage)
  tags: text("tags").array().default([]),
  classLevel: text("class_level").notNull(), // Required for better readability
  marks: integer("marks").default(1),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const questionsInformationTechnologyRelations = relations(
  questionsInformationTechnology,
  ({ one }) => ({
    chapter: one(chapters, {
      fields: [questionsInformationTechnology.chapterId],
      references: [chapters.id],
    }),
    creator: one(profiles, {
      fields: [questionsInformationTechnology.createdBy],
      references: [profiles.id],
    }),
  })
);

// ============================================
// Exam Structures (Blueprints)
// ============================================
export const examStructures = pgTable("exam_structures", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id").references(() => subjects.id, {
    onDelete: "cascade",
  }),
  classLevelId: uuid("class_level_id").references(() => classLevels.id, {
    onDelete: "set null",
  }),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  classLevel: text("class_level"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  totalQuestions: integer("total_questions").notNull().default(50),
  totalMarks: integer("total_marks").notNull().default(100),
  passingPercentage: integer("passing_percentage").notNull().default(35),
  sections: jsonb("sections").default([]),
  isTemplate: boolean("is_template").default(false),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const examStructuresRelations = relations(examStructures, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [examStructures.subjectId],
    references: [subjects.id],
  }),
  classLevel: one(classLevels, {
    fields: [examStructures.classLevelId],
    references: [classLevels.id],
  }),
  exams: many(exams),
  scheduledExams: many(scheduledExams),
}));

// ============================================
// Scheduled Exams
// ============================================
export const scheduledExamStatuses = ["draft", "scheduled", "active", "completed", "cancelled"] as const;
export type ScheduledExamStatus = (typeof scheduledExamStatuses)[number];

export const scheduledExams = pgTable("scheduled_exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  classLevelId: uuid("class_level_id")
    .notNull()
    .references(() => classLevels.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  examStructureId: uuid("exam_structure_id").references(() => examStructures.id, {
    onDelete: "set null",
  }),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  totalMarks: integer("total_marks").notNull().default(100),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  scheduledDate: date("scheduled_date"),
  scheduledTime: time("scheduled_time"),
  status: text("status").notNull().default("draft"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  publishResults: boolean("publish_results").default(false),
  maxAttempts: integer("max_attempts").default(0), // 0 = unlimited attempts
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const scheduledExamsRelations = relations(scheduledExams, ({ one }) => ({
  classLevel: one(classLevels, {
    fields: [scheduledExams.classLevelId],
    references: [classLevels.id],
  }),
  subject: one(subjects, {
    fields: [scheduledExams.subjectId],
    references: [subjects.id],
  }),
  examStructure: one(examStructures, {
    fields: [scheduledExams.examStructureId],
    references: [examStructures.id],
  }),
}));

// ============================================
// Exams (Student attempts)
// ============================================
export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  subjectId: uuid("subject_id").references(() => subjects.id),
  examStructureId: uuid("exam_structure_id").references(() => examStructures.id),
  scheduledExamId: uuid("scheduled_exam_id").references(() => scheduledExams.id),
  status: text("status").notNull().default("in_progress"),
  score: integer("score"),
  totalMarks: integer("total_marks"),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
  currentQuestionIndex: integer("current_question_index").default(0),
  timeRemainingSeconds: integer("time_remaining_seconds"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const examsRelations = relations(exams, ({ one, many }) => ({
  user: one(profiles, {
    fields: [exams.userId],
    references: [profiles.id],
  }),
  subject: one(subjects, {
    fields: [exams.subjectId],
    references: [subjects.id],
  }),
  examStructure: one(examStructures, {
    fields: [exams.examStructureId],
    references: [examStructures.id],
  }),
  scheduledExam: one(scheduledExams, {
    fields: [exams.scheduledExamId],
    references: [scheduledExams.id],
  }),
  answers: many(examAnswers),
}));

// ============================================
// Exam Answers
// ============================================
export const examAnswers = pgTable("exam_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull(),
  questionTable: text("question_table").notNull(),
  userAnswer: jsonb("user_answer"),
  isCorrect: boolean("is_correct"),
  marksObtained: integer("marks_obtained").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const examAnswersRelations = relations(examAnswers, ({ one }) => ({
  exam: one(exams, {
    fields: [examAnswers.examId],
    references: [exams.id],
  }),
}));

// ============================================
// TypeScript Types (Inferred from schema)
// ============================================
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;


export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

export type ClassLevel = typeof classLevels.$inferSelect;
export type NewClassLevel = typeof classLevels.$inferInsert;

export type SubjectClassMapping = typeof subjectClassMappings.$inferSelect;
export type NewSubjectClassMapping = typeof subjectClassMappings.$inferInsert;

export type QuestionScholarship = typeof questionsScholarship.$inferSelect;
export type NewQuestionScholarship = typeof questionsScholarship.$inferInsert;

export type QuestionEnglish = typeof questionsEnglish.$inferSelect;
export type NewQuestionEnglish = typeof questionsEnglish.$inferInsert;

export type QuestionIT = typeof questionsInformationTechnology.$inferSelect;
export type NewQuestionIT = typeof questionsInformationTechnology.$inferInsert;

export type ExamStructure = typeof examStructures.$inferSelect;
export type NewExamStructure = typeof examStructures.$inferInsert;

export type ScheduledExam = typeof scheduledExams.$inferSelect;
export type NewScheduledExam = typeof scheduledExams.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export type ExamAnswer = typeof examAnswers.$inferSelect;
export type NewExamAnswer = typeof examAnswers.$inferInsert;

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;

// ============================================
// Question Import Batches
// ============================================
export const questionImportBatches = pgTable("question_import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectSlug: text("subject_slug").notNull(),
  batchName: text("batch_name"),
  status: text("status").notNull().default("pending"), // pending, reviewed, imported, cancelled
  parsedQuestions: jsonb("parsed_questions").notNull().default([]),
  metadata: jsonb("metadata"), // file names, upload date, OCR settings, etc.
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  importedAt: timestamp("imported_at", { withTimezone: true }),
});

export const questionImportBatchesRelations = relations(questionImportBatches, ({ one }) => ({
  creator: one(profiles, {
    fields: [questionImportBatches.createdBy],
    references: [profiles.id],
  }),
}));

export type QuestionImportBatch = typeof questionImportBatches.$inferSelect;
export type NewQuestionImportBatch = typeof questionImportBatches.$inferInsert;
