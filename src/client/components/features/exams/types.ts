export interface ClassLevel {
    id: string;
    name_en: string;
}

export interface Subject {
    id: string;
    name_en: string;
}

export interface ExamStructure {
    id: string;
    name_en: string;
    total_marks: number;
}

export interface ScheduledExam {
    id: string;
    name_en: string;
    name_mr: string | null;
    status: string;
    scheduled_date: string | null;
    scheduled_time?: string | null;
    duration_minutes: number | null;
    class_level: ClassLevel | null;
    subject: Subject | null;
    exam_structure: ExamStructure | null;
    attempts_count: number;
}
