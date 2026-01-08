# Database Seed Scripts

This directory contains modular seed scripts for populating the database with test data.

## Structure

### Core Seed Files

- **`seed-all.ts`** - Main orchestrator that runs all seed scripts in proper dependency order
- **`db.ts`** - Database connection setup for seed scripts
- **`index.ts`** - Barrel exports for all seed functions
- **`users.ts`** - Creates test users (admin, teacher, student) with proper school relations
- **`subjects.ts`** - Seeds subject catalog (Scholarship category + IT subject)
- **`class-levels.ts`** - Seeds class/grade levels (4, 5, 7, 8, 11, 12)
- **`subject-class-mappings.ts`** - Maps subjects to class levels
- **`chapters.ts`** - Seeds chapters for subjects
- **`questions-it.ts`** - Seeds IT questions (English primary) with user relations
- **`questions-scholarship.ts`** - Seeds Scholarship questions (Marathi primary) with user relations
- **`exam-structures.ts`** - Seeds exam blueprints/templates with proper relations
- **`scheduled-exams.ts`** - Seeds scheduled exam instances linked to structures
- **`schools.ts`** - Seeds schools from CSV file

## Usage

### Seed All Data

```bash
npm run db:seed
# or
npx tsx src/db/seeds/seed-all.ts
```

This runs all seed scripts in the correct dependency order:
1. **Phase 1: Core Entities** - Subjects, Class Levels
2. **Phase 2: Mappings** - Subject-Class Mappings
3. **Phase 3: Dependent Entities** - Chapters
4. **Phase 4: Schools** - Independent entities
5. **Phase 5: Users** - Requires schools for relations
6. **Phase 6: Questions** - Requires users, chapters, subjects
7. **Phase 7: Exam Structures** - Requires subjects, class levels
8. **Phase 8: Scheduled Exams** - Requires exam structures, subjects, class levels

### Seed Individual Components

```bash
# Seed users only
npx tsx src/db/seeds/users.ts

# Seed IT questions only
npx tsx src/db/seeds/questions-it.ts

# Seed Scholarship questions only
npx tsx src/db/seeds/questions-scholarship.ts

# Seed subjects
npx tsx src/db/seeds/subjects.ts

# Seed chapters
npx tsx src/db/seeds/chapters.ts

# Seed schools
npx tsx src/db/seeds/schools.ts
```

## Test Users

The seed script creates three test users with proper relations:

| Email | Password | Role | Language | School | Permissions |
|-------|----------|------|----------|--------|-------------|
| `admin@abhedya.com` | `Admin@123456` | admin | English | None | Full access |
| `teacher@abhedya.com` | `Teacher@123` | teacher | English | Linked | Manage questions, exams, view analytics |
| `student@abhedya.com` | `Student@123` | student | Marathi | Linked | Take exams, view results |

### User Permissions

**Admin:**
- ✅ Manage users
- ✅ Manage questions
- ✅ Manage exams
- ✅ View analytics
- ✅ Manage settings

**Teacher:**
- ✅ Manage questions
- ✅ View analytics
- ✅ Manage exams

**Student:**
- ✅ Take exams
- ✅ View own results
- ✅ View own history

## Database Relations

All seeds properly handle foreign key relations:

- **Users ↔ Schools**: Teachers and students are linked to schools
- **Chapters ↔ Subjects**: Chapters belong to subjects
- **Questions ↔ Chapters**: Questions linked to chapters
- **Questions ↔ Users**: Questions linked to creator (admin/teacher)
- **Exam Structures ↔ Subjects & Class Levels**: Structures linked to subjects and classes
- **Scheduled Exams ↔ Exam Structures**: Scheduled exams linked to structures
- **Subject-Class Mappings**: Proper many-to-many relationships

## Questions Seeded

### Information Technology (English)
- **50+ questions** total
- **10** Fill in the Blanks
- **10** True/False
- **10** MCQ Single
- **5** MCQ Two (two correct answers)
- **5** Short Answer
- **5** Match
- Primary language: English
- Class level: 12
- Linked to: IT chapters, Admin/Teacher user

### Scholarship (Marathi)
- **50+ questions** total
- **10** Fill in the Blanks
- **10** True/False
- **10** MCQ Single
- **5** MCQ Two (two correct answers)
- **5** Short Answer
- **5** Match
- Primary language: Marathi
- Class levels: 4, 5, 7, 8
- Linked to: Scholarship chapters, Admin/Teacher user

## Best Practices

1. **Modular Design**: Each seed script handles one domain (users, questions, etc.)
2. **Idempotent**: Scripts check for existing data and update/skip as needed
3. **Error Handling**: Graceful error handling with informative messages
4. **Dependency Order**: Seed scripts respect dependencies (subjects before chapters, etc.)
5. **Type Safety**: All scripts use TypeScript with proper types
6. **Logging**: Clear console output showing progress and results
7. **Relations**: All foreign keys properly set with cascade/set null behaviors
8. **Data Integrity**: Validates dependencies before inserting related data

## Adding New Seed Data

1. Create a new file: `seeds/new-data.ts`
2. Export a function: `export async function seedNewData() { ... }`
3. Add proper error handling and idempotency checks
4. Import and call in `seed-all.ts` in the correct dependency order
5. Add to `index.ts` for barrel exports
6. Add npm script in `package.json` if needed

## Notes

- Seed scripts use Supabase Admin API for creating auth users
- Profile records are linked to auth user IDs
- Questions use the language-aware schema (`question_text`, `question_language`)
- All seed data is marked as active (`is_active: true`)
- Scripts can be run multiple times safely (idempotent)
- Foreign key constraints are properly handled
- All relations are properly established

## Troubleshooting

### Common Issues

1. **"Subject not found"**: Run `seedSubjects()` first
2. **"Chapter not found"**: Run `seedChapters()` after subjects
3. **"User not found"**: Run `seedUsers()` before seeding questions
4. **"School not found"**: Run `seedSchools()` before seeding users
5. **Foreign key violations**: Ensure dependencies are seeded in correct order

### Reset Database

To start fresh:
```bash
# Drop and recreate database (if needed)
npm run db:reset

# Then seed all data
npm run db:seed
```
