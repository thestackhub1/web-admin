
import { dbService } from "./dbService";
import { count, eq, sql, desc, and, gte, lt } from "drizzle-orm";
import {
    profiles,
    scheduledExams,
    exams,
    questionsScholarship,
    subjects,
    chapters
} from "@/db/schema";

export class AnalyticsService {
    private static instance: AnalyticsService;

    private constructor() { }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    /**
     * Get main dashboard statistics matching DashboardStats interface
     */
    async getDashboardStats() {
        return dbService.executeQuery(async (db) => {
            // Parallelize count queries
            const [
                totalUsersResult,
                activeStudentsResult,
                totalExamsResult,
                completedExamsResult,
                totalQuestionsResult,
                avgScoreResult,
                activeScheduledResult
            ] = await Promise.all([
                db.select({ count: count() }).from(profiles),
                db.select({ count: count() }).from(profiles).where(and(eq(profiles.role, 'student'), eq(profiles.isActive, true))),
                db.select({ count: count() }).from(exams),
                db.select({ count: count() }).from(exams).where(eq(exams.status, 'completed')),
                db.select({ count: count() }).from(questionsScholarship),
                db.select({ avg: sql<number>`avg(${exams.percentage})` }).from(exams).where(eq(exams.status, 'completed')),
                db.select({ count: count() }).from(scheduledExams).where(eq(scheduledExams.status, 'active'))
            ]);

            // Calculate Pass Rate (>= 35% is pass)
            const passedExamsResult = await db.select({ count: count() }).from(exams).where(and(eq(exams.status, 'completed'), gte(exams.percentage, 35)));
            const passedCount = passedExamsResult[0].count;
            const completedCount = completedExamsResult[0].count;
            const passRate = completedCount > 0 ? (passedCount / completedCount) * 100 : 0;

            const totalExamsCount = totalExamsResult[0].count;
            const completionRate = totalExamsCount > 0 ? (completedCount / totalExamsCount) * 100 : 0;

            // Real questionsBySubject: join questions -> chapters -> subjects
            const subjectColors: Record<string, string> = {
                "Mathematics": "#3B82F6",
                "Science": "#10B981",
                "English": "#F59E0B",
                "History": "#8B5CF6",
                "Geography": "#EC4899",
                "Information Technology": "#06B6D4",
            };
            const defaultColors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316"];

            const questionsBySubjectRaw = await db
                .select({
                    subject: subjects.nameEn,
                    count: count()
                })
                .from(questionsScholarship)
                .innerJoin(chapters, eq(questionsScholarship.chapterId, chapters.id))
                .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
                .groupBy(subjects.nameEn)
                .orderBy(desc(count()))
                .limit(6);

            const questionsBySubject = questionsBySubjectRaw.map((row, index) => ({
                subject: row.subject || "Unknown",
                count: row.count,
                color: subjectColors[row.subject || ""] || defaultColors[index % defaultColors.length]
            }));

            // Real questionsByDifficulty
            const difficultyColors: Record<string, string> = {
                "easy": "#10B981",
                "medium": "#F59E0B",
                "hard": "#EF4444"
            };

            const questionsByDifficultyRaw = await db
                .select({
                    difficulty: questionsScholarship.difficulty,
                    count: count()
                })
                .from(questionsScholarship)
                .groupBy(questionsScholarship.difficulty)
                .orderBy(desc(count()));

            const questionsByDifficulty = questionsByDifficultyRaw.map(row => ({
                difficulty: row.difficulty ? row.difficulty.charAt(0).toUpperCase() + row.difficulty.slice(1) : "Unknown",
                count: row.count,
                color: difficultyColors[row.difficulty || "medium"] || "#F59E0B"
            }));

            return {
                totalUsers: totalUsersResult[0].count,
                activeStudents: activeStudentsResult[0].count,
                totalExams: totalExamsCount,
                completedExams: completedCount,
                totalQuestions: totalQuestionsResult[0].count,
                averageScore: Math.round(Number(avgScoreResult[0]?.avg || 0)),
                passRate: Math.round(passRate),
                completionRate: Math.round(completionRate),
                activeScheduledExams: activeScheduledResult[0].count,
                questionsBySubject,
                questionsByDifficulty
            };
        });
    }

    /**
     * Get KPI metrics matching KpiMetrics interface
     */
    async getKpiMetrics() {
        return dbService.executeQuery(async (db) => {
            const currentDate = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(currentDate.getMonth() - 1);
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

            // Convert to ISO strings for SQLite comparison
            const lastMonthISO = lastMonth.toISOString();
            const twoMonthsAgoISO = twoMonthsAgo.toISOString();

            // Current period: last month to now
            const [
                newUsersThisMonth,
                totalUsers,
                totalStudents,
                totalExamsThisMonth,
                _completedExamsThisMonth,
                _avgScoreThisMonth
            ] = await Promise.all([
                db.select({ count: count() }).from(profiles).where(gte(profiles.createdAt, lastMonthISO)),
                db.select({ count: count() }).from(profiles),
                db.select({ count: count() }).from(profiles).where(eq(profiles.role, 'student')),
                db.select({ count: count() }).from(exams).where(gte(exams.createdAt, lastMonthISO)),
                db.select({ count: count() }).from(exams).where(and(eq(exams.status, 'completed'), gte(exams.createdAt, lastMonthISO))),
                db.select({ avg: sql<number>`avg(${exams.percentage})` }).from(exams).where(and(eq(exams.status, 'completed'), gte(exams.createdAt, lastMonthISO)))
            ]);

            // Previous period: two months ago to last month
            const [
                usersLastPeriod,
                examsLastPeriod,
                completedExamsLastPeriod,
                avgScoreLastPeriod
            ] = await Promise.all([
                db.select({ count: count() }).from(profiles).where(and(gte(profiles.createdAt, twoMonthsAgoISO), lt(profiles.createdAt, lastMonthISO))),
                db.select({ count: count() }).from(exams).where(and(gte(exams.createdAt, twoMonthsAgoISO), lt(exams.createdAt, lastMonthISO))),
                db.select({ count: count() }).from(exams).where(and(eq(exams.status, 'completed'), gte(exams.createdAt, twoMonthsAgoISO), lt(exams.createdAt, lastMonthISO))),
                db.select({ avg: sql<number>`avg(${exams.percentage})` }).from(exams).where(and(eq(exams.status, 'completed'), gte(exams.createdAt, twoMonthsAgoISO), lt(exams.createdAt, lastMonthISO)))
            ]);

            const previousTotalUsers = totalUsers[0].count - newUsersThisMonth[0].count;
            const userGrowth = previousTotalUsers > 0 ? (newUsersThisMonth[0].count / previousTotalUsers) * 100 : (newUsersThisMonth[0].count > 0 ? 100 : 0);

            const previousExamsCount = examsLastPeriod[0].count;
            const examGrowth = previousExamsCount > 0 ? ((totalExamsThisMonth[0].count - previousExamsCount) / previousExamsCount) * 100 : (totalExamsThisMonth[0].count > 0 ? 100 : 0);

            // Compute real avgExamsPerStudent
            const studentCount = totalStudents[0].count;
            const totalExamsAll = (await db.select({ count: count() }).from(exams))[0].count;
            const avgExamsPerStudent = studentCount > 0 ? Math.round((totalExamsAll / studentCount) * 10) / 10 : 0;

            // Students who took at least one exam (basic retention proxy)
            const studentsWithExams = (await db.selectDistinct({ userId: exams.userId }).from(exams).where(eq(exams.status, 'completed'))).length;
            const retentionRate = studentCount > 0 ? Math.round((studentsWithExams / studentCount) * 100) : 0;

            return {
                studentRetentionRate: retentionRate,
                avgExamsPerStudent,
                monthlyEnrollmentGrowth: Math.round(userGrowth * 10) / 10,
                monthlyExamGrowth: Math.round(examGrowth * 10) / 10,
                previousPeriod: {
                    totalUsers: usersLastPeriod[0].count,
                    totalExams: examsLastPeriod[0].count,
                    completedExams: completedExamsLastPeriod[0].count,
                    averageScore: Math.round(Number(avgScoreLastPeriod[0]?.avg || 0)),
                    newUsers: usersLastPeriod[0].count
                },
                questionTypeBreakdown: []
            };
        });
    }

    /**
     * Get Recent Activity matching Exam[] interface
     */
    async getRecentActivity(limit = 5) {
        return dbService.executeQuery(async (db) => {
            const recentExams = await db.query.exams.findMany({
                orderBy: [desc(exams.createdAt)],
                limit: limit,
                with: {
                    user: { columns: { id: true, name: true, email: true, avatarUrl: true } },
                    subject: { columns: { id: true, nameEn: true } },
                    examStructure: { columns: { id: true, nameEn: true } },
                    scheduledExam: { columns: { id: true, nameEn: true } }
                }
            });

            return recentExams.map(exam => ({
                id: exam.id,
                user_id: exam.userId,
                status: exam.status as any,
                score: exam.score,
                total_marks: exam.totalMarks,
                percentage: Number(exam.percentage),
                started_at: exam.startedAt || null,
                completed_at: exam.completedAt || null,
                subject_id: exam.subjectId,
                exam_structure_id: exam.examStructureId,
                scheduled_exam_id: exam.scheduledExamId,
                profiles: {
                    id: exam.user?.id || '',
                    name: exam.user?.name || '',
                    email: exam.user?.email || '',
                    avatar_url: exam.user?.avatarUrl
                },
                subjects: {
                    id: exam.subject?.id || '',
                    name_en: exam.subject?.nameEn || ''
                },
                exam_structure: {
                    id: exam.examStructure?.id || '',
                    name_en: exam.examStructure?.nameEn || ''
                }
            }));
        });
    }

    /**
     * Get Class Level Analytics (Real Data)
     */
    async getClassLevelAnalytics() {
        return dbService.executeQuery(async (db) => {
            // Get all class levels first
            const classLevelsList = await db.query.classLevels.findMany({
                columns: { nameEn: true }
            });

            // For each class level, aggregate data
            const stats = await Promise.all(
                classLevelsList.map(async (cl) => {
                    const levelName = cl.nameEn;

                    // Count students in this class level
                    const studentCount = (await db
                        .select({ count: count() })
                        .from(profiles)
                        .where(and(
                            eq(profiles.role, 'student'),
                            eq(profiles.classLevel, levelName)
                        )))[0].count;

                    // Aggregate exam stats for users in this class level
                    // Join exams -> profiles
                    const examStats = (await db
                        .select({
                            total: count(),
                            avgScore: sql<number>`avg(${exams.percentage})`,
                            passed: sql<number>`count(case when ${exams.percentage} >= 35 then 1 end)`
                        })
                        .from(exams)
                        .innerJoin(profiles, eq(exams.userId, profiles.id))
                        .where(eq(profiles.classLevel, levelName))
                    )[0];

                    const totalExams = examStats.total;
                    const passRate = totalExams > 0
                        ? (Number(examStats.passed) / totalExams) * 100
                        : 0;

                    return {
                        classLevel: levelName,
                        totalStudents: studentCount,
                        totalExams: totalExams,
                        averageScore: Math.round(Number(examStats.avgScore || 0)),
                        passRate: Math.round(passRate)
                    };
                })
            );

            // Filter out empty classes? No, let's show all available classes.
            return stats.sort((a, b) => b.totalStudents - a.totalStudents);
        });
    }

    /**
     * Get Subject Analytics (Real Data)
     */
    async getSubjectAnalytics() {
        return dbService.executeQuery(async (db) => {
            // Get top subjects
            const subjectList = await db
                .select({
                    id: subjects.id,
                    name: subjects.nameEn
                })
                .from(subjects)
                .limit(10);

            const stats = await Promise.all(
                subjectList.map(async (subj) => {
                    // 1. Total Questions (Scholarship only for now)
                    // Direct join with chapters
                    const questionsCount = (await db
                        .select({ count: count() })
                        .from(questionsScholarship)
                        .innerJoin(chapters, eq(questionsScholarship.chapterId, chapters.id))
                        .where(eq(chapters.subjectId, subj.id))
                    )[0].count;

                    // 2. Exam Stats
                    const examStats = (await db
                        .select({
                            count: count(),
                            avg: sql<number>`avg(${exams.percentage})`
                        })
                        .from(exams)
                        .where(eq(exams.subjectId, subj.id))
                    )[0];

                    return {
                        subject: subj.name,
                        totalQuestions: questionsCount,
                        totalExams: examStats.count,
                        averageScore: Math.round(Number(examStats.avg || 0)),
                        chapterPerformance: []
                    };
                })
            );

            return stats.sort((a, b) => b.totalExams - a.totalExams);
        });
    }

    /**
     * Get Monthly Trends (Real Data)
     */
    async getMonthlyTrends() {
        return dbService.executeQuery(async (db) => {
            // Calculate date 6 months ago for SQLite
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1); // First day of that month
            sixMonthsAgo.setHours(0, 0, 0, 0);
            const sixMonthsAgoISO = sixMonthsAgo.toISOString();

            // 1. Enrollments by Month (Last 6 months) - SQLite compatible
            const enrollmentTrends = await db.all(
                sql`
                SELECT 
                    strftime('%m', created_at) as month_num,
                    strftime('%Y-%m', created_at) as month_key,
                    count(*) as count
                FROM profiles
                WHERE role = 'student'
                AND created_at >= ${sixMonthsAgoISO}
                GROUP BY month_key
                ORDER BY month_key ASC
                `
            );

            // 2. Exams by Month - SQLite compatible
            const examTrends = await db.all(
                sql`
                SELECT 
                    strftime('%m', created_at) as month_num,
                    strftime('%Y-%m', created_at) as month_key,
                    count(*) as total,
                    sum(case when status = 'completed' then 1 else 0 end) as completed
                FROM exams
                WHERE created_at >= ${sixMonthsAgoISO}
                GROUP BY month_key
                ORDER BY month_key ASC
                `
            );

            // Merge Data in JS
            // Create map of month_label -> data
            const trendMap = new Map<string, any>();

            // Initialize last 6 months buckets relative to current date
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthKeyToLabel = new Map<string, string>();
            
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthLabel = monthNames[d.getMonth()];
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthKeyToLabel.set(monthKey, monthLabel);
                trendMap.set(monthKey, {
                    month: monthLabel,
                    enrollments: 0,
                    exams: 0,
                    completions: 0
                });
            }

            // Fill Enrollments
            (enrollmentTrends as any[]).forEach((row: any) => {
                const key = row.month_key;
                if (trendMap.has(key)) {
                    const item = trendMap.get(key);
                    item.enrollments = Number(row.count);
                }
            });

            // Fill Exams
            (examTrends as any[]).forEach((row: any) => {
                const key = row.month_key;
                if (trendMap.has(key)) {
                    const item = trendMap.get(key);
                    item.exams = Number(row.total);
                    item.completions = Number(row.completed);
                }
            });

            return Array.from(trendMap.values());
        });
    }
}

export const analyticsService = AnalyticsService.getInstance();
