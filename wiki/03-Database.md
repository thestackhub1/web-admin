# The Stack Hub Admin Dashboard - Database Setup

## Database Management with Drizzle ORM

This project uses **Drizzle ORM** for database schema management. No manual SQL migrations needed!

### Quick Commands

```bash
# Setup database (push schema + seed data)
npm run db:setup

# Push schema changes to database (development)
npm run db:push

# Seed database with test data
npm run db:seed

# Open Drizzle Studio to browse database
npm run db:studio

# Generate migration files (for production)
npm run db:generate

# Run migrations (for production)
npm run db:migrate

# Reset database (push + seed)
npm run db:reset
```

### Schema Location

All database tables are defined in: `src/lib/db/schema.ts`

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to Supabase Auth |
| `subjects` | Scholarship, English, Information Technology |
| `chapters` | Chapters within subjects (for question organization) |
| `class_levels` | Class organization (Class 8, 9, 10, 11, 12) |
| `subject_class_mappings` | Many-to-many: subjects ↔ class levels |

### Question Tables

| Table | Description |
|-------|-------------|
| `questions_scholarship` | Scholarship exam questions |
| `questions_english` | English exam questions |
| `questions_information_technology` | IT exam questions |

**Question Language Structure (New Schema):**
All question tables use a subject-aware language system:
- `question_text` (text, NOT NULL) - Primary question text
- `question_language` (text, NOT NULL) - Primary language: "en" or "mr"
  - **Scholarship**: Defaults to "mr" (Marathi)
  - **English/IT**: Defaults to "en" (English)
- `question_text_secondary` (text, nullable) - Optional translation
- `secondary_language` (text, nullable) - Secondary language if translation exists

**Other Question Fields:**
- `chapter_id` (FK to chapters)
- `marks` (integer, default 1) for weighted scoring
- `question_type` (fill_blank, true_false, mcq_single, etc.)
- `difficulty` (easy, medium, hard)
- `answer_data` (jsonb) - Type-specific answer structure
- `explanation_en` / `explanation_mr` (text, nullable)
- `tags` (text array)
- `is_active` (boolean)

### Exam Tables

| Table | Description |
|-------|-------------|
| `exam_structures` | Exam blueprints with sections JSON |
| `scheduled_exams` | Scheduled exams (Test 1, Test 2, Final Exam) |
| `exams` | Student exam attempts |
| `exam_answers` | Individual answers |

### Content Management Tables

| Table | Description |
|-------|-------------|
| `question_import_batches` | Bulk question import tracking (PDF/CSV) |
| `schools` | School directory for student signup |

### Class Levels & Scheduling

**`class_levels`** - Class organization
- `id`, `name_en`, `name_mr`, `slug`
- `description_en`, `description_mr`
- `icon`, `color`, `order_index`, `is_active`

**`subject_class_mappings`** - Subject-Class relationships
- `subject_id` → `subjects.id`
- `class_level_id` → `class_levels.id`

**`scheduled_exams`** - Scheduled exam instances
- `class_level_id`, `subject_id`, `exam_structure_id` (nullable)
- `name_en`, `name_mr`, `description_en`, `description_mr`
- `total_marks`, `duration_minutes`
- `scheduled_date`, `scheduled_time`
- `status`: draft | scheduled | published | in_progress | completed | cancelled
- `order_index`, `is_active`, `publish_results`, `max_attempts`
- `max_attempts`: 0 = unlimited practice attempts

**`question_import_batches`** - Bulk question import tracking
- `subject_slug` - Subject for imported questions
- `batch_name` - User-friendly batch identifier
- `status` - pending | reviewed | imported | cancelled
- `parsed_questions` (jsonb) - Extracted questions from file
- `metadata` (jsonb) - File info, upload date, AI model used
- `created_by` - User who uploaded
- `imported_at` - Timestamp when batch was committed

**`schools`** - School directory
- `name`, `name_search` (normalized for duplicate detection)
- `location_city`, `location_state`, `location_country`
- `is_verified` - Admin verification status
- `student_count` - Cached student enrollment
- `created_by` - User who created the school entry

**`exam_structures`** additions:
- `class_level_id` (FK to class_levels, nullable)
- `is_template` (boolean, default true)

**`exams`** additions:
- `class_level_id` (FK to class_levels)
- `scheduled_exam_id` (FK to scheduled_exams)

---

## Question Types (8 total)

| Type | Description |
|------|-------------|
| `fill_blank` | Fill in the blanks |
| `true_false` | True/False statements |
| `mcq_single` | MCQ with 1 correct answer |
| `mcq_two` | MCQ with 2 correct answers |
| `mcq_three` | MCQ with 3 correct answers |
| `match` | Match the pairs |
| `short_answer` | Brief written answers |
| `programming` | Code-based questions |

---

## Class 12 IT Curriculum

**Chapters (6 total):**

| Chapter | Name | Marks (Required) | Marks (With Option) |
|---------|------|------------------|---------------------|
| 1 | Web Publishing | 20 | 25 |
| 2 | Introduction to SEO | 10 | 12 |
| 3 | Advanced JavaScript | 15 | 20 |
| 4 | Emerging Technologies | 10 | 12 |
| 5 | Server Side Scripting (PHP) | 15 | 15 |
| 6 | E-Commerce and E-Governance | 10 | 12 |
| **Total** | | **80** | **96** |

**Exam Structure (8 sections, 80 marks):**

| Q.No | Description | Questions | Marks |
|------|-------------|-----------|-------|
| 1 | Fill in the Blanks | 10 | 10 |
| 2 | State True or False | 10 | 10 |
| 3 | MCQ (Single Correct) | 10 | 10 |
| 4 | MCQ (Two Correct) | 10 | 20 |
| 5 | MCQ (Three Correct) | 2 | 6 |
| 6 | Match the Following | 4 | 4 |
| 7 | Short Answers | 8 (solve 5) | 10 |
| 8 | Programming/Code | 4 (solve 2) | 10 |
| **Total** | | **54+** | **80** |

---

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to everything |
| `teacher` | Manage questions, view analytics |
| `student` | Take exams, view own results |

---

## RLS (Row Level Security)

All tables use Supabase RLS with these patterns:

- Users can view/edit their own data
- Staff (admin/teacher) can manage content
- `is_admin()` and `is_staff()` are SECURITY DEFINER functions

---

## Environment Setup

Required environment variables in `.env`:

```bash
# Supabase connection (pooler - port 6543)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres"

# Direct connection for migrations (port 5432)
DATABASE_URL_DIRECT="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres"
```

---

## Test Users

Create these users in **Supabase Dashboard → Authentication → Users**:

| Email | Password | Role |
|-------|----------|------|
| `admin@abhedya.com` | `Admin@123456` | admin |
| `teacher@abhedya.com` | `Teacher@123` | teacher |
| `student@abhedya.com` | `Student@123` | student |

---

## Question Language System

### Subject-Aware Language Defaults

The platform uses a subject-aware approach for question languages:

| Subject | Primary Language | Default | Secondary Language |
|---------|-----------------|---------|-------------------|
| Scholarship | Marathi | `question_language = "mr"` | English (optional) |
| English | English | `question_language = "en"` | Marathi (optional) |
| Information Technology | English | `question_language = "en"` | Marathi (optional) |

### Language Fields

**Primary Fields:**
- `question_text` - The main question text (required)
- `question_language` - Language of primary text: "en" or "mr" (required, auto-set by subject)

**Secondary Fields (Optional):**
- `question_text_secondary` - Translation of the question
- `secondary_language` - Language of secondary text: "en" or "mr"

### Usage Examples

**Scholarship Question (Marathi Primary):**
```json
{
  "question_text": "संगणकाचा मेंदू म्हणजे _____.",
  "question_language": "mr",
  "question_text_secondary": "The brain of the computer is _____.",
  "secondary_language": "en"
}
```

**IT Question (English Primary):**
```json
{
  "question_text": "What does CPU stand for?",
  "question_language": "en",
  "question_text_secondary": "CPU म्हणजे काय?",
  "secondary_language": "mr"
}
```

### Migration Notes

- Old schema used `question_text_en` and `question_text_mr` (both required)
- New schema uses `question_text` + `question_language` (subject-aware)
- Migration completed - old fields removed
- Seed scripts updated to use new format

---

## Quick Reference

```bash
# Install dependencies and setup database
npm run setup:full

# Start dev server
npm run dev

# Build for production
npm run build

# Push schema to database
npm run db:push

# Seed test data
npm run db:seed

# Browse database
npm run db:studio

# Reset database (push + seed)
npm run db:reset
```

---

## Mobile App API Reference

All APIs are under `/api/v1/` and require Bearer token authentication.

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Register new student |
| `/auth/login` | POST | Login with email/phone + password |
| `/auth/logout` | POST | Sign out user |
| `/auth/refresh` | POST | Refresh access token |

### Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/profile` | GET | Get current user profile |
| `/profile` | PUT | Update profile (name, language) |

### Subjects & Chapters

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/subjects` | GET | List all active subjects |
| `/subjects/:slug` | GET | Get subject by slug |
| `/subjects/:slug/chapters` | GET | Get chapters for a subject |
| `/subjects/:slug/exam-structure` | GET | Get exam structure |
| `/subjects/:slug/questions` | GET | Get questions (filterable) |
| `/subjects/:slug/section-practice` | GET | Get section practice questions |

### Class Levels (New)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/class-levels` | GET | List all class levels (8, 9, 10, 11, 12) |
| `/class-levels/:slug` | GET | Get class level with available subjects |
| `/class-levels/:slug/subjects` | GET | Get subjects for a class level |
| `/class-levels/:slug/scheduled-exams` | GET | Get scheduled exams for class level |

### Scheduled Exams (New)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scheduled-exams` | GET | List published scheduled exams |
| `/scheduled-exams/:id` | GET | Get scheduled exam details |
| `/scheduled-exams/:id/start` | POST | Start a scheduled exam |

### Exams

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/exams` | POST | Start a new exam |
| `/exams` | GET | Get user's exam history |
| `/exams/:id` | GET | Get exam by ID |
| `/exams/:id/answers` | POST | Submit an answer |
| `/exams/:id/submit` | POST | Submit/complete exam |
| `/exams/:id/result` | GET | Get exam result |

### Exam Structures

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/exam-structures` | GET | List exam blueprints |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analytics/my-performance` | GET | Get student performance stats |

