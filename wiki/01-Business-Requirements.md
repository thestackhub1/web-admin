# Business Requirements Document (BRD) - The Stack Hub Platform

## 1. Executive Summary

**The Stack Hub** is a comprehensive EdTech platform designed to facilitate assessment-driven learning. The platform connects students, teachers, and administrators through two distinct portals:
1.  **Admin Portal**: For content management, user administration, and system configuration.
2.  **Student Portal**: For taking exams, practicing questions, and tracking performance.

The system emphasizes high-quality content management (bilingual support, heavy rich text/math support), rigorous exam scheduling, and detailed performance analytics.

---

## 2. User Roles & Permissions

The platform enforces strict Role-Based Access Control (RBAC).

### 2.1. Admin (`admin`)
*   **Access**: Full system access.
*   **Responsibilities**:
    *   Manage all users (Teachers, Students).
    *   Manage structural data (Class Levels, Subjects, Chapters, Schools).
    *   Create and manage Exam Structures (Blueprints).
    *   **Question Bank**: Full access to add, edit, delete, and import questions.
    *   Schedule exams and publish results.
    *   Oversee global analytics and system health.

### 2.2. Teacher (`teacher`)
*   **Access**: Content and Analytics focus.
*   **Responsibilities**:
    *   **Question Bank**: Add, edit, and review questions across all subjects.
    *   **Assessments**: Create exam drafts or section-specific practice sets.
    *   **Analytics**: View student performance data (but cannot manage system settings).
    *   **Review**: Verify imported questions for accuracy.

### 2.3. Student (`student`)
*   **Access**: Student Portal only (Restricted API access).
*   **Responsibilities**:
    *   Take scheduled exams.
    *   Practice via "Section Practice" flows.
    *   View personal results and analytics.
    *   Manage own profile.

---

## 3. Core Modules

### 3.1. Course Management
The curriculum is structured logically to support multiple educational boards and streams.
*   **Class Levels**: Top-level hierarchy (e.g., Class 10, Class 12, Scholarship).
*   **Subjects**: Linked to Class Levels (e.g., "English", "IT", "Intelligence Test").
    *   **Language Support**: Questions can be created in English, Marathi, or any other supported language. English is selected by default.
*   **Chapters**: Granular topics within subjects for precise question categorization.

### 3.2. Question Bank
A centralized repository of questions supporting diverse formats and languages.
*   **Question Types** (8 types):
    1.  **Fill in the Blank**: Basic text completion.
    2.  **True/False**: Binary choice.
    3.  **MCQ (Single)**: Traditional multiple choice.
    4.  **MCQ (Multi)**: Multiple correct answers.
    5.  **Match the Pair**: Association testing.
    6.  **Short Answer**: Text-based response (manual or keyword grading).
    7.  **Programming**: Code snippets (for IT subjects).
    8.  **Comprehension**: Questions based on a passage (future scope).
*   **Features**:
    *   **Rich Text**: Support for MathJax/KaTeX formulas, images, and tables.
    *   **Language Selection**: Single language per question (English, Marathi, etc.), selectable during creation. Default: English.
    *   **Metadata**: Difficulty (Easy/Medium/Hard), Marks, and Tags.
    *   **Bulk Import**: AI-assisted parsing from PDF/CSV files.

### 3.3. Exam System
A robust engine for conducting high-stakes and practice assessments.
*   **Exam Structure (Blueprint)**: Defines the *template* of an exam (e.g., "Final Exam Pattern": 10 MCQs, 5 True/False).
*   **Scheduled Exams**: An instance of a Structure assigned to a specific date/time.
    *   **States**: Draft → Scheduled → Published → In Progress → Completed.
    *   **Constraints**: Duration, Max Attempts (0 for unlimited), Negative Marking.
*   **Practice Mode**: On-demand quizzes generated from the Question Bank based on specific chapters or subjects.

### 3.4. School & User Management
*   **Schools**: Registry of institutions to group students.
*   **Onboarding**:
    *   Students sign up via mobile/web, selecting their Class and School.
    *   Admins/Teachers are invited or created by Super Admins.

---

## 4. Workflows

### 4.1. Question Creation Workflow
1.  **Drafting**: Teacher/Admin inputs question text, selects type, defines answer key.
2.  **Tagging**: Subject, Chapter, and Difficulty are assigned.
3.  **Review**: (Optional) Secondary review for high-stakes content.
4.  **Activation**: Question becomes available for Exam generation.

### 4.2. Exam Lifecycle
1.  **Blueprint Creation**: Admin defines the section-wise breakdown (e.g., Section A: 20 marks, Section B: 40 marks).
2.  **Scheduling**: Admin sets the date, time, and duration for the exam.
3.  **Publishing**: Exam becomes visible to relevant Class Level students.
4.  **Execution**: Students take the exam within the window. Auto-submission on timer expiry.
5.  **Result Processing**:
    *   Objective questions (MCQ/Fill/TrueFalse) are auto-graded.
    *   Results are published immediately or after manual review (configurable).

---

## 5. Technical Requirements & Constraints

*   **Platform**: Web-based (Next.js App Router).
*   **Database**: PostgreSQL (Supabase) with Drizzle ORM.
*   **Authentication**: Supabase Auth (Phone/Email).
*   **Security**:
    *   **RLS**: All database access is scoped by user ID and Role.
    *   **API**: Strict validation on all inputs (Zod).
*   **Performance**:
    *   Static/ISR rendering for public pages.
    *   Real-time updates for Exam status not required (polling sufficient).
*   **Design**:
    *   **UI Library**: Custom components with Tailwind CSS.
    *   **Theme**: Support for Dark/Light modes (System default).

---
*Document Version: 1.0 | Last Updated: 2024*
