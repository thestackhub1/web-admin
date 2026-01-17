/**
 * Database Schema - SQLite/Turso
 *
 * This schema is designed for Turso (libSQL/SQLite) using Drizzle ORM.
 * Migrated from PostgreSQL with the following adaptations:
 *
 * - UUID columns → TEXT (store as 36-char strings)
 * - JSONB columns → TEXT with { mode: "json" }
 * - Array columns → TEXT with { mode: "json" }
 * - Boolean columns → INTEGER with { mode: "boolean" }
 * - Timestamp columns → TEXT (ISO 8601 strings)
 * - Date/Time columns → TEXT (formatted strings)
 * - Numeric columns → REAL (floating point)
 *
 * @module db/schema
 */

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================
// Type Definitions
// ============================================

/**
 * JSON object type for JSONB-like fields
 */
type JsonObject = Record<string, unknown>;

/**
 * Answer data structure for questions
 */
interface AnswerData {
  correctAnswer?: string | string[];
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  blanks?: string[];
  [key: string]: unknown;
}

/**
 * Section structure for exam blueprints
 */
interface ExamSection {
  name: string;
  questionCount: number;
  marks: number;
  [key: string]: unknown;
}

// ============================================
// Profiles
// ============================================
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  schoolId: text("school_id"),
  classLevel: text("class_level"),
  role: text("role").notNull().default("student"),
  permissions: text("permissions", { mode: "json" })
    .$type<JsonObject>()
    .default({}),
  preferredLanguage: text("preferred_language").default("en"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ============================================
// Schools
// ============================================
export const schools = sqliteTable("schools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameSearch: text("name_search").notNull(),
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationCountry: text("location_country").default("India"),
  address: text("address"),
  type: text("type"),
  level: text("level"),
  foundedYear: text("founded_year"),
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  isUserAdded: integer("is_user_added", { mode: "boolean" }).default(false),
  createdBy: text("created_by"),
  studentCount: integer("student_count").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
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
export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(),
  parentSubjectId: text("parent_subject_id"),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  slug: text("slug").unique().notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  icon: text("icon"),
  orderIndex: integer("order_index").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isCategory: integer("is_category", { mode: "boolean" }).default(false),
  isPaper: integer("is_paper", { mode: "boolean" }).default(false),
  paperNumber: text("paper_number"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  parentSubject: one(subjects, {
    fields: [subjects.parentSubjectId],
    references: [subjects.id],
    relationName: "parent_child_subjects",
  }),
  subSubjects: many(subjects, {
    relationName: "parent_child_subjects",
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
export const classLevels = sqliteTable("class_levels", {
  id: text("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  slug: text("slug").unique().notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  orderIndex: integer("order_index").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const classLevelsRelations = relations(classLevels, ({ many }) => ({
  subjectClassMappings: many(subjectClassMappings),
  scheduledExams: many(scheduledExams),
  examStructures: many(examStructures),
}));

// ============================================
// Subject-Class Mappings
// ============================================
export const subjectClassMappings = sqliteTable("subject_class_mappings", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  classLevelId: text("class_level_id")
    .notNull()
    .references(() => classLevels.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at"),
});

export const subjectClassMappingsRelations = relations(
  subjectClassMappings,
  ({ one }) => ({
    subject: one(subjects, {
      fields: [subjectClassMappings.subjectId],
      references: [subjects.id],
    }),
    classLevel: one(classLevels, {
      fields: [subjectClassMappings.classLevelId],
      references: [classLevels.id],
    }),
  })
);

// ============================================
// Chapters
// ============================================
export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  orderIndex: integer("order_index").default(1),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
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
export const questionsScholarship = sqliteTable("questions_scholarship", {
  id: text("id").primaryKey(),
  questionText: text("question_text").notNull(),
  questionLanguage: text("question_language").notNull().default("mr"),
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  answerData: text("answer_data", { mode: "json" })
    .$type<AnswerData>()
    .notNull(),
  explanation: text("explanation"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  classLevel: text("class_level").notNull(),
  marks: integer("marks").default(1),
  chapterId: text("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by").references(() => profiles.id),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const questionsScholarshipRelations = relations(
  questionsScholarship,
  ({ one }) => ({
    chapter: one(chapters, {
      fields: [questionsScholarship.chapterId],
      references: [chapters.id],
    }),
    creator: one(profiles, {
      fields: [questionsScholarship.createdBy],
      references: [profiles.id],
    }),
  })
);

// ============================================
// Questions - English
// ============================================
export const questionsEnglish = sqliteTable("questions_english", {
  id: text("id").primaryKey(),
  questionText: text("question_text").notNull(),
  questionLanguage: text("question_language").notNull().default("en"),
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  answerData: text("answer_data", { mode: "json" })
    .$type<AnswerData>()
    .notNull(),
  explanation: text("explanation"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  classLevel: text("class_level").notNull(),
  marks: integer("marks").default(1),
  chapterId: text("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by").references(() => profiles.id),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const questionsEnglishRelations = relations(
  questionsEnglish,
  ({ one }) => ({
    chapter: one(chapters, {
      fields: [questionsEnglish.chapterId],
      references: [chapters.id],
    }),
    creator: one(profiles, {
      fields: [questionsEnglish.createdBy],
      references: [profiles.id],
    }),
  })
);

// ============================================
// Questions - Information Technology
// ============================================
export const questionsInformationTechnology = sqliteTable(
  "questions_information_technology",
  {
    id: text("id").primaryKey(),
    questionText: text("question_text").notNull(),
    questionLanguage: text("question_language").notNull().default("en"),
    questionType: text("question_type").notNull(),
    difficulty: text("difficulty").notNull().default("medium"),
    answerData: text("answer_data", { mode: "json" })
      .$type<AnswerData>()
      .notNull(),
    explanation: text("explanation"),
    tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
    classLevel: text("class_level").notNull(),
    marks: integer("marks").default(1),
    chapterId: text("chapter_id").references(() => chapters.id, {
      onDelete: "set null",
    }),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdBy: text("created_by").references(() => profiles.id),
    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
  }
);

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
export const examStructures = sqliteTable("exam_structures", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").references(() => subjects.id, {
    onDelete: "cascade",
  }),
  classLevelId: text("class_level_id").references(() => classLevels.id, {
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
  sections: text("sections", { mode: "json" })
    .$type<ExamSection[]>()
    .default([]),
  isTemplate: integer("is_template", { mode: "boolean" }).default(false),
  orderIndex: integer("order_index").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const examStructuresRelations = relations(
  examStructures,
  ({ one, many }) => ({
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
  })
);

// ============================================
// Scheduled Exams
// ============================================
export const scheduledExamStatuses = [
  "draft",
  "scheduled",
  "active",
  "completed",
  "cancelled",
] as const;
export type ScheduledExamStatus = (typeof scheduledExamStatuses)[number];

export const scheduledExams = sqliteTable("scheduled_exams", {
  id: text("id").primaryKey(),
  classLevelId: text("class_level_id")
    .notNull()
    .references(() => classLevels.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  examStructureId: text("exam_structure_id").references(
    () => examStructures.id,
    {
      onDelete: "set null",
    }
  ),
  nameEn: text("name_en").notNull(),
  nameMr: text("name_mr").notNull(),
  descriptionEn: text("description_en"),
  descriptionMr: text("description_mr"),
  totalMarks: integer("total_marks").notNull().default(100),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  scheduledDate: text("scheduled_date"), // YYYY-MM-DD format
  scheduledTime: text("scheduled_time"), // HH:MM:SS format
  status: text("status").notNull().default("draft"),
  orderIndex: integer("order_index").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  publishResults: integer("publish_results", { mode: "boolean" }).default(
    false
  ),
  maxAttempts: integer("max_attempts").default(0), // 0 = unlimited attempts
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
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
export const exams = sqliteTable("exams", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  subjectId: text("subject_id").references(() => subjects.id),
  examStructureId: text("exam_structure_id").references(() => examStructures.id),
  scheduledExamId: text("scheduled_exam_id").references(() => scheduledExams.id),
  status: text("status").notNull().default("in_progress"),
  score: integer("score"),
  totalMarks: integer("total_marks"),
  percentage: real("percentage"), // Decimal as floating point
  currentQuestionIndex: integer("current_question_index").default(0),
  timeRemainingSeconds: integer("time_remaining_seconds"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
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
export const examAnswers = sqliteTable("exam_answers", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  questionTable: text("question_table").notNull(),
  userAnswer: text("user_answer", { mode: "json" }).$type<unknown>(),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  marksObtained: integer("marks_obtained").default(0),
  createdAt: text("created_at"),
});

export const examAnswersRelations = relations(examAnswers, ({ one }) => ({
  exam: one(exams, {
    fields: [examAnswers.examId],
    references: [exams.id],
  }),
}));

// ============================================
// Question Import Batches
// ============================================
export const questionImportBatches = sqliteTable("question_import_batches", {
  id: text("id").primaryKey(),
  subjectSlug: text("subject_slug").notNull(),
  batchName: text("batch_name"),
  status: text("status").notNull().default("pending"), // pending, reviewed, imported, cancelled
  parsedQuestions: text("parsed_questions", { mode: "json" })
    .$type<unknown[]>()
    .notNull()
    .default([]),
  metadata: text("metadata", { mode: "json" }).$type<JsonObject>(),
  createdBy: text("created_by").references(() => profiles.id),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  importedAt: text("imported_at"),
});

export const questionImportBatchesRelations = relations(
  questionImportBatches,
  ({ one }) => ({
    creator: one(profiles, {
      fields: [questionImportBatches.createdBy],
      references: [profiles.id],
    }),
  })
);

// ============================================
// TypeScript Types (Inferred from schema)
// ============================================
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;

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

export type QuestionImportBatch = typeof questionImportBatches.$inferSelect;
export type NewQuestionImportBatch = typeof questionImportBatches.$inferInsert;
