/**
 * Services Layer - Public API
 * 
 * Exports all service modules for convenient imports
 */

export { dbService, getDb, type RLSContext, type GetDbOptions } from './dbService';
export { default as dbServiceDefault } from './dbService';
export { ExamsService } from './exams.service';

// Re-export AI services
export * from './ai';

// Re-export domain services
export { SubjectsService } from './subjects.service';
export { ClassLevelsService } from './class-levels.service';
export { ExamStructuresService } from './exam-structures.service';
export { ChaptersService } from './chapters.service';
export { UsersService } from './users.service';
export { ProfileService } from './profile.service';
export { ScheduledExamsService } from './scheduled-exams.service';
export { SchoolsService } from './schools.service';
export { QuestionsService } from './questions.service';
export { QuestionImportService } from './question-import.service';
export { uploadsService } from './uploads.service';
