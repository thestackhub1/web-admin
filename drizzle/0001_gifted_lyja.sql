ALTER TABLE "exams" ADD COLUMN "current_question_index" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "time_remaining_seconds" integer;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "founded_year" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "is_user_added" boolean DEFAULT false;