CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"name_en" text NOT NULL,
	"name_mr" text NOT NULL,
	"description_en" text,
	"description_mr" text,
	"order_index" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "class_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_mr" text NOT NULL,
	"slug" text NOT NULL,
	"description_en" text,
	"description_mr" text,
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "class_levels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exam_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid,
	"question_id" uuid NOT NULL,
	"question_table" text NOT NULL,
	"user_answer" jsonb,
	"is_correct" boolean,
	"marks_obtained" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid,
	"class_level_id" uuid,
	"name_en" text NOT NULL,
	"name_mr" text NOT NULL,
	"description_en" text,
	"description_mr" text,
	"class_level" text,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"total_questions" integer DEFAULT 50 NOT NULL,
	"total_marks" integer DEFAULT 100 NOT NULL,
	"passing_percentage" integer DEFAULT 35 NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb,
	"is_template" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"subject_id" uuid,
	"exam_structure_id" uuid,
	"scheduled_exam_id" uuid,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"score" integer,
	"total_marks" integer,
	"percentage" numeric(5, 2),
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"name" text,
	"avatar_url" text,
	"school_id" uuid,
	"class_level" text,
	"role" text DEFAULT 'student' NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"preferred_language" text DEFAULT 'en',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "question_import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_slug" text NOT NULL,
	"batch_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"parsed_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"imported_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "questions_english" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_text" text NOT NULL,
	"question_language" text DEFAULT 'en' NOT NULL,
	"question_text_secondary" text,
	"secondary_language" text,
	"question_type" text NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"answer_data" jsonb NOT NULL,
	"explanation_en" text,
	"explanation_mr" text,
	"tags" text[] DEFAULT '{}',
	"class_level" text,
	"marks" integer DEFAULT 1,
	"chapter_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions_information_technology" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_text" text NOT NULL,
	"question_language" text DEFAULT 'en' NOT NULL,
	"question_text_secondary" text,
	"secondary_language" text,
	"question_type" text NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"answer_data" jsonb NOT NULL,
	"explanation_en" text,
	"explanation_mr" text,
	"tags" text[] DEFAULT '{}',
	"class_level" text,
	"marks" integer DEFAULT 1,
	"chapter_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions_scholarship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_text" text NOT NULL,
	"question_language" text DEFAULT 'mr' NOT NULL,
	"question_text_secondary" text,
	"secondary_language" text,
	"question_type" text NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"answer_data" jsonb NOT NULL,
	"explanation_en" text,
	"explanation_mr" text,
	"tags" text[] DEFAULT '{}',
	"class_level" text,
	"marks" integer DEFAULT 1,
	"chapter_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_level_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"exam_structure_id" uuid,
	"name_en" text NOT NULL,
	"name_mr" text NOT NULL,
	"description_en" text,
	"description_mr" text,
	"total_marks" integer DEFAULT 100 NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"scheduled_date" date,
	"scheduled_time" time,
	"status" text DEFAULT 'draft' NOT NULL,
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"publish_results" boolean DEFAULT false,
	"max_attempts" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_search" text NOT NULL,
	"location_city" text,
	"location_state" text,
	"location_country" text DEFAULT 'India',
	"is_verified" boolean DEFAULT false,
	"created_by" uuid,
	"student_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subject_class_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_level_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_subject_id" uuid,
	"name_en" text NOT NULL,
	"name_mr" text NOT NULL,
	"slug" text NOT NULL,
	"description_en" text,
	"description_mr" text,
	"icon" text,
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_category" boolean DEFAULT false,
	"is_paper" boolean DEFAULT false,
	"paper_number" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_structures" ADD CONSTRAINT "exam_structures_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_structures" ADD CONSTRAINT "exam_structures_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_exam_structure_id_exam_structures_id_fk" FOREIGN KEY ("exam_structure_id") REFERENCES "public"."exam_structures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_scheduled_exam_id_scheduled_exams_id_fk" FOREIGN KEY ("scheduled_exam_id") REFERENCES "public"."scheduled_exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_import_batches" ADD CONSTRAINT "question_import_batches_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_english" ADD CONSTRAINT "questions_english_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_english" ADD CONSTRAINT "questions_english_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_information_technology" ADD CONSTRAINT "questions_information_technology_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_information_technology" ADD CONSTRAINT "questions_information_technology_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_scholarship" ADD CONSTRAINT "questions_scholarship_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_scholarship" ADD CONSTRAINT "questions_scholarship_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_exams" ADD CONSTRAINT "scheduled_exams_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_exams" ADD CONSTRAINT "scheduled_exams_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_exams" ADD CONSTRAINT "scheduled_exams_exam_structure_id_exam_structures_id_fk" FOREIGN KEY ("exam_structure_id") REFERENCES "public"."exam_structures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_class_mappings" ADD CONSTRAINT "subject_class_mappings_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_class_mappings" ADD CONSTRAINT "subject_class_mappings_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE cascade ON UPDATE no action;