# Testing Guide - The Stack Hub Platform

This guide provides comprehensive instructions for testing the The Stack Hub Platform with end-to-end test data.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Test Users](#test-users)
4. [Test Data Overview](#test-data-overview)
5. [End-to-End Test Scenarios](#end-to-end-test-scenarios)
6. [Question Types Testing](#question-types-testing)
7. [Exam Flow Testing](#exam-flow-testing)
8. [API Testing](#api-testing)
9. [Common Test Cases](#common-test-cases)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Setup database (creates tables + seeds data)
npm run db:setup

# Start development server
npm run dev
```

### 2. Access the Application

- **Admin Dashboard**: `http://localhost:3000/dashboard`
- **Student Portal**: `http://localhost:3000/student`
- **Drizzle Studio** (Database Browser): Run `npm run db:studio`

---

## 🗄️ Database Setup

### Full Database Reset

```bash
# Reset database (drops and recreates tables, then seeds)
npm run db:reset
```

### Individual Seed Operations

```bash
# Seed all data
npm run db:seed

# Seed specific components
npm run db:seed:users
npm run db:seed:subjects
npm run db:seed:chapters
npm run db:seed:questions-it
npm run db:seed:questions-scholarship
npm run db:seed:exam-structures
npm run db:seed:scheduled-exams
```

### Database Browser

```bash
# Open Drizzle Studio to browse database
npm run db:studio
```

This opens a web interface at `http://localhost:4983` where you can:
- View all tables
- Browse seeded data
- Run queries
- Inspect relationships

---

## 👥 Test Users

The seed script creates three test users with different roles:

| Email | Password | Role | Preferred Language | Permissions |
|-------|----------|------|-------------------|-------------|
| `admin@abhedya.com` | `Admin@123456` | **Admin** | English | Full access |
| `teacher@abhedya.com` | `Teacher@123` | **Teacher** | English | Question & Exam management |
| `student@abhedya.com` | `Student@123` | **Student** | Marathi | Exam taking, results viewing |

### User Permissions

#### Admin (`admin@abhedya.com`)
- ✅ Manage all users
- ✅ Create/edit/delete questions
- ✅ Create/edit/delete exams
- ✅ View all analytics
- ✅ Manage system settings
- ✅ Access all subjects and classes

#### Teacher (`teacher@abhedya.com`)
- ✅ Create/edit questions
- ✅ Create/edit exams
- ✅ View analytics for assigned classes
- ✅ Manage exam schedules
- ❌ Cannot manage users
- ❌ Cannot access system settings

#### Student (`student@abhedya.com`)
- ✅ Take scheduled exams
- ✅ Practice questions by chapter/section
- ✅ View own exam results
- ✅ View own performance history
- ❌ Cannot create questions or exams
- ❌ Cannot view other students' data

---

## 📊 Test Data Overview

### Subjects

1. **Information Technology** (slug: `information_technology`)
   - Class: 12
   - Primary Language: English
   - Chapters: 7 chapters (Computer Basics, Hardware, Software, Web Publishing, SEO, JavaScript, PHP)

2. **Scholarship** (slug: `scholarship`)
   - Classes: 8, 9, 10
   - Primary Language: Marathi
   - Chapters: 5 chapters (General Knowledge, Mathematics, Science, Geography, History)

3. **English** (slug: `english`)
   - Available but not seeded with questions yet

### Questions Seeded

#### Information Technology (50 questions)
- **10** Fill in the Blanks
- **10** True/False
- **10** MCQ Single
- **5** MCQ Two (two correct answers)
- **5** Short Answer
- **5** Match
- **5** Additional questions (various types)

**Total**: 50 questions across 7 chapters

#### Scholarship (50 questions)
- **10** Fill in the Blanks (Marathi)
- **10** True/False (Marathi)
- **10** MCQ Single (Marathi)
- **5** MCQ Two (Marathi)
- **5** Short Answer (Marathi)
- **5** Match (Marathi)
- **5** Additional questions (various types)

**Total**: 50 questions across 5 chapters

### Exam Structures

- **Class 12 IT Board Exam Pattern** (80 marks, 180 minutes)
  - Fill in the Blanks: 10 questions (10 marks)
  - True/False: 10 questions (10 marks)
  - MCQ Single: 10 questions (10 marks)
  - MCQ Two: 10 questions (20 marks)

- **Unit Test Pattern** (25 marks, 45 minutes)
  - Fill in the Blanks: 5 questions (5 marks)
  - MCQ Single: 10 questions (10 marks)
  - Short Answer: 5 questions (10 marks)

### Scheduled Exams

5 scheduled exams for Class 12 IT:
1. Unit Test 1 (25 marks, 45 minutes)
2. Unit Test 2 (25 marks, 45 minutes)
3. Mid-Term Exam (50 marks, 90 minutes)
4. Preliminary Exam (80 marks, 180 minutes)
5. Final Board Exam (80 marks, 180 minutes)

---

## 🎯 End-to-End Test Scenarios

### Scenario 1: Admin Creates and Manages Questions

1. **Login as Admin**
   - Go to `http://localhost:3000/dashboard`
   - Login with `admin@abhedya.com` / `Admin@123456`

2. **Navigate to Questions**
   - Click "Questions" in sidebar
   - Select subject: "Information Technology"

3. **Create a New Question**
   - Click "Add Question"
   - Fill in question text (English)
   - Select question type: "MCQ Single"
   - Add options and mark correct answer
   - Add explanation
   - Save

4. **Edit Question**
   - Find a question in the list
   - Click "Edit"
   - Modify question text or options
   - Save changes

5. **Bulk Import Questions**
   - Click "Import Questions"
   - Upload a PDF or CSV file
   - Review extracted questions
   - Commit import

### Scenario 2: Teacher Creates an Exam

1. **Login as Teacher**
   - Login with `teacher@abhedya.com` / `Teacher@123`

2. **Create Exam Structure**
   - Go to "Exam Structures"
   - Click "Create Exam Structure"
   - Define sections (Fill Blank, MCQ, etc.)
   - Set marks and time limits
   - Save

3. **Create Scheduled Exam**
   - Go to "Scheduled Exams"
   - Click "Create Exam"
   - Select subject and class
   - Choose exam structure
   - Set date and time
   - Save

### Scenario 3: Student Takes an Exam

1. **Login as Student**
   - Go to `http://localhost:3000/student`
   - Login with `student@abhedya.com` / `Student@123`

2. **View Available Exams**
   - Dashboard shows scheduled exams
   - Click on an exam to view details

3. **Start Exam**
   - Click "Start Exam"
   - Confirm you're ready
   - Timer starts

4. **Answer Questions**
   - Navigate through questions
   - Answer each question
   - Review answers before submission

5. **Submit Exam**
   - Click "Submit Exam"
   - Confirm submission
   - View results immediately (for auto-graded questions)

6. **Review Results**
   - View score and percentage
   - See correct/incorrect answers
   - Read explanations

### Scenario 4: Practice Mode

1. **Login as Student**
   - Login with `student@abhedya.com` / `Student@123`

2. **Practice by Chapter**
   - Go to "Subjects" → "Information Technology"
   - Select a chapter
   - Click "Practice"
   - Answer questions one by one
   - View explanations after each answer

3. **Practice by Section**
   - Go to "Subjects" → Select subject
   - Choose a section (e.g., "Fill in the Blanks")
   - Practice questions of that type

---

## 📝 Question Types Testing

### 1. Fill in the Blank

**Test Cases:**
- Single blank question
- Multiple blanks question
- Case-insensitive matching
- Multiple acceptable answers per blank

**Example from Seed Data:**
- Question: "HTML stands for _____."
- Acceptable answers: "HyperText Markup Language", "HTML"

### 2. True/False

**Test Cases:**
- True answer selection
- False answer selection
- Boolean vs string input handling

**Example from Seed Data:**
- Question: "HTML is a programming language."
- Correct answer: `false`

### 3. MCQ Single

**Test Cases:**
- Select one correct option
- Visual feedback on selection
- Option shuffling (if enabled)

**Example from Seed Data:**
- Question: "Which HTML tag is used to create a paragraph?"
- Options: ["<div>", "<span>", "<p>", "<br>"]
- Correct: 2 (index)

### 4. MCQ Two

**Test Cases:**
- Select exactly two correct options
- Validation for two selections
- Partial credit (if configured)

**Example from Seed Data:**
- Question: "Which of the following are server-side scripting languages? (Select two)"
- Options: ["JavaScript", "PHP", "HTML", "Python"]
- Correct: [1, 3] (PHP and Python)

### 5. Short Answer

**Test Cases:**
- Text input field
- Manual grading required
- Keyword matching (for auto-suggestions)

**Example from Seed Data:**
- Question: "Explain the difference between HTTP and HTTPS in one sentence."
- Keywords: ["secure", "SSL", "TLS", "encryption"]

### 6. Match

**Test Cases:**
- Drag-and-drop matching
- Left-to-right pairing
- Visual feedback on matches

**Example from Seed Data:**
- Question: "Match the following HTML tags with their purposes:"
- Pairs: [{"<p>": "Paragraph"}, {"<a>": "Link"}, ...]

---

## 📋 Exam Flow Testing

### Creating an Exam

1. **As Admin/Teacher:**
   - Create exam structure (blueprint)
   - Define sections and question types
   - Set total marks and duration

2. **Schedule Exam:**
   - Create scheduled exam instance
   - Assign to class/subject
   - Set date and time
   - Publish to students

### Taking an Exam

1. **Student View:**
   - See scheduled exams on dashboard
   - Click "Start Exam"
   - Timer begins countdown

2. **During Exam:**
   - Navigate questions
   - Answer all questions
   - Review before submission
   - Timer warning at 5 minutes remaining

3. **Submission:**
   - Auto-graded questions scored immediately
   - Manual grading required for short/long answers
   - Results displayed with explanations

### Exam Results

1. **Immediate Results:**
   - Score and percentage
   - Pass/fail status
   - Question-wise breakdown

2. **Review Mode:**
   - See correct answers
   - Read explanations
   - Understand mistakes

---

## 🔌 API Testing

### Authentication

```bash
# Login endpoint
POST /api/auth/login
{
  "email": "student@abhedya.com",
  "password": "Student@123"
}
```

### Questions API

```bash
# Get questions by subject
GET /api/v1/questions/information_technology?classLevel=12

# Get question by ID
GET /api/v1/questions/information_technology/[id]

# Create question (Admin/Teacher)
POST /api/v1/questions/information_technology
{
  "questionText": "...",
  "questionLanguage": "en",
  "questionType": "mcq_single",
  ...
}
```

### Exams API

```bash
# Get scheduled exams
GET /api/v1/exams/scheduled

# Get exam details
GET /api/v1/exams/[id]

# Submit exam attempt
POST /api/v1/exams/[id]/submit
{
  "answers": [...]
}
```

### Student API

```bash
# Get student dashboard
GET /api/v1/student/dashboard

# Get practice questions
GET /api/v1/student/practice?subject=information_technology&chapter=[id]
```

---

## ✅ Common Test Cases

### Authentication & Authorization

- [ ] Admin can access all routes
- [ ] Teacher cannot access user management
- [ ] Student cannot access admin dashboard
- [ ] Unauthenticated users redirected to login
- [ ] Session persistence across page refreshes

### Question Management

- [ ] Create question with all types
- [ ] Edit existing question
- [ ] Delete question (soft delete)
- [ ] Bulk import from PDF/CSV
- [ ] Search and filter questions
- [ ] Language toggle (English/Marathi)

### Exam Management

- [ ] Create exam structure
- [ ] Schedule exam
- [ ] Publish/unpublish exam
- [ ] Student can see published exams
- [ ] Timer works correctly
- [ ] Auto-submit on time expiry

### Student Experience

- [ ] View available exams
- [ ] Start exam
- [ ] Answer all question types
- [ ] Navigate between questions
- [ ] Submit exam
- [ ] View results with explanations
- [ ] Practice mode works correctly

### Data Integrity

- [ ] Questions linked to correct chapters
- [ ] Exams use correct exam structure
- [ ] Answers saved correctly
- [ ] Scores calculated accurately
- [ ] Language fields populated correctly

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solution**:
1. Check `.env` file has `DATABASE_URL`
2. Verify Supabase credentials
3. Run `npm run db:push` to ensure tables exist

### Seed Script Errors

**Problem**: Seed script fails

**Solution**:
1. Ensure dependencies are seeded in order:
   ```bash
   npm run db:seed:subjects
   npm run db:seed:chapters
   npm run db:seed:questions-it
   ```
2. Check for existing data conflicts
3. Run `npm run db:reset` for clean start

### User Login Issues

**Problem**: Cannot login with test users

**Solution**:
1. Ensure users are seeded: `npm run db:seed:users`
2. Check Supabase Auth is configured
3. Verify email/password are correct (case-sensitive)
4. Check browser console for errors

### Question Display Issues

**Problem**: Questions not showing or language incorrect

**Solution**:
1. Verify questions are seeded: `npm run db:seed:questions-it`
2. Check `question_language` field in database
3. Verify subject slug matches (e.g., `information_technology`)
4. Check chapter assignments

### Exam Not Appearing

**Problem**: Student cannot see scheduled exam

**Solution**:
1. Verify exam is scheduled: `npm run db:seed:scheduled-exams`
2. Check exam status is "published"
3. Verify student's class matches exam class
4. Check exam date/time is in future

---

## 📚 Additional Resources

- **Database Schema**: See [DATABASE.md](./DATABASE.md)
- **Business Requirements**: See [BUSINESS_REQUIREMENTS.md](./BUSINESS_REQUIREMENTS.md)
- **Seed Scripts**: See `src/lib/db/seed/README.md`
- **API Documentation**: See [DATABASE.md](./DATABASE.md) → Mobile App API Reference

---

## 🔄 Updating Test Data

### Adding More Questions

1. Edit `src/lib/db/seed/questions-it.ts` or `questions-scholarship.ts`
2. Add questions to appropriate function
3. Run `npm run db:seed:questions-it` or `npm run db:seed:questions-scholarship`

### Adding More Users

1. Edit `src/lib/db/seed/users.ts`
2. Add user object to `testUsers` array
3. Run `npm run db:seed:users`

### Adding More Exams

1. Edit `src/lib/db/seed/scheduled-exams.ts`
2. Add exam objects to array
3. Run `npm run db:seed:scheduled-exams`

---

**Last Updated**: 2024-12-04

**Maintained By**: Development Team

