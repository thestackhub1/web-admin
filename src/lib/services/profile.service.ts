/**
 * Profile Service
 * 
 * Business logic for user profile operations.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, or, ilike } from 'drizzle-orm';
import { profiles, classLevels, exams } from '@/db/schema';
import { sql } from 'drizzle-orm';

export interface ProfileUpdateData {
  name?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
  classLevel?: string;
}

export class ProfileService {
  /**
   * Get user profile with stats
   */
  static async getProfile(userId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [profile] = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        name: profiles.name,
        role: profiles.role,
        preferredLanguage: profiles.preferredLanguage,
        avatarUrl: profiles.avatarUrl,
        isActive: profiles.isActive,
        classLevel: profiles.classLevel,
        schoolId: profiles.schoolId,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile) {
      return null;
    }

    // Resolve class_level_id from class_level text
    let classLevelId: string | null = null;
    let classLevelDetails: { id: string; nameEn: string; nameMr: string; slug: string } | null = null;

    if (profile.classLevel) {
      const [classLevel] = await db
        .select({
          id: classLevels.id,
          nameEn: classLevels.nameEn,
          nameMr: classLevels.nameMr,
          slug: classLevels.slug,
        })
        .from(classLevels)
        .where(
          and(
            eq(classLevels.isActive, true),
            or(
              eq(classLevels.slug, profile.classLevel),
              ilike(classLevels.nameEn, `%${profile.classLevel}%`)
            )!
          )
        )
        .limit(1);

      if (classLevel) {
        classLevelId = classLevel.id;
        classLevelDetails = {
          id: classLevel.id,
          nameEn: classLevel.nameEn,
          nameMr: classLevel.nameMr,
          slug: classLevel.slug,
        };
      }
    }

    // Fetch user's exam stats
    const completedExams = await db
      .select({
        id: exams.id,
        status: exams.status,
        score: exams.score,
        totalMarks: exams.totalMarks,
        percentage: exams.percentage,
        startedAt: exams.startedAt,
        completedAt: exams.completedAt,
        createdAt: exams.createdAt,
      })
      .from(exams)
      .where(
        and(
          eq(exams.userId, userId),
          eq(exams.status, 'completed')
        )
      )
      .orderBy(sql`${exams.completedAt} DESC`);

    // Calculate stats
    const totalExamsTaken = completedExams.length;

    const averageScore = totalExamsTaken > 0
      ? Math.round(
        completedExams.reduce((sum, e) => sum + (Number(e.percentage) || 0), 0) / totalExamsTaken
      )
      : 0;

    // Calculate total time from timestamps
    const totalTimeSpentSeconds = completedExams.reduce((sum, e) => {
      if (e.startedAt && e.completedAt) {
        const started = new Date(e.startedAt).getTime();
        const completed = new Date(e.completedAt).getTime();
        return sum + Math.floor((completed - started) / 1000);
      }
      return sum;
    }, 0);

    const streakDays = this.calculateStreakDays(completedExams);

    const lastActivityAt = completedExams.length > 0 ? completedExams[0].completedAt : null;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      preferred_language: profile.preferredLanguage,
      avatar_url: profile.avatarUrl,
      is_active: profile.isActive,
      class_level: profile.classLevel,
      school_id: profile.schoolId,
      created_at: profile.createdAt?.toISOString(),
      updated_at: profile.updatedAt?.toISOString(),
      class_level_id: classLevelId,
      class_level_details: classLevelDetails,
      total_exams_taken: totalExamsTaken,
      average_score: averageScore,
      total_time_spent_seconds: totalTimeSpentSeconds,
      streak_days: streakDays,
      last_activity_at: lastActivityAt?.toISOString(),
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdateData, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.preferredLanguage !== undefined) updateData.preferredLanguage = updates.preferredLanguage;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
    if (updates.classLevel !== undefined) updateData.classLevel = updates.classLevel;

    const [updated] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, userId))
      .returning({
        id: profiles.id,
        email: profiles.email,
        name: profiles.name,
        role: profiles.role,
        preferredLanguage: profiles.preferredLanguage,
        avatarUrl: profiles.avatarUrl,
        isActive: profiles.isActive,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      });

    if (!updated) {
      return null;
    }

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      preferred_language: updated.preferredLanguage,
      avatar_url: updated.avatarUrl,
      is_active: updated.isActive,
      created_at: updated.createdAt?.toISOString(),
      updated_at: updated.updatedAt?.toISOString(),
    };
  }

  /**
   * Calculate streak days from exam history
   */
  private static calculateStreakDays(exams: Array<{ completedAt: Date | null }>): number {
    if (!exams || exams.length === 0) return 0;

    const completedExams = exams
      .filter(e => e.completedAt)
      .map(e => new Date(e.completedAt!).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // unique dates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (completedExams.length === 0) return 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if most recent activity is today or yesterday
    if (completedExams[0] !== today && completedExams[0] !== yesterday) {
      return 0;
    }


    let streak = 1;
    let currentDate = new Date(completedExams[0]);

    for (let i = 1; i < completedExams.length; i++) {
      const prevDate = new Date(currentDate.getTime() - 86400000).toDateString();
      if (completedExams[i] === prevDate) {
        streak++;
        currentDate = new Date(completedExams[i]);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, password: string) {
    const { getSupabaseAdmin } = await import('@/lib/api/supabase-admin');
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: password,
    });

    if (error) {
      throw error;
    }

    return true;
  }
}

