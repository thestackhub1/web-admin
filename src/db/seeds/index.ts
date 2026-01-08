// Export all seed functions for programmatic use
export { seedUsers } from "./users";
export { seedSubjects } from "./subjects";
export { seedClassLevels } from "./class-levels";
export { seedSubjectClassMappings } from "./subject-class-mappings";
export { seedChapters } from "./chapters";
export { seedITQuestions } from "./questions-it";
export { seedScholarshipQuestions } from "./questions-scholarship";
export { seedExamStructures } from "./exam-structures";
export { seedScheduledExams } from "./scheduled-exams";

// Export db connection for direct use
export { db, schema, client } from "./db";
