/**
 * Authentication Service
 *
 * Handles user authentication, registration, and session management.
 * Replaces Supabase Auth with custom JWT-based implementation.
 */

import { eq, or } from "drizzle-orm";
import { profiles } from "@/db/schema.turso";
import { DbService as TursoDbService } from "@/lib/services/dbService.turso";
import {
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  type AuthTokens,
  type TokenPayload,
} from "./jwt";
import { hashPassword, verifyPassword } from "./password";
import { generateId } from "@/db/utils/id";
import { nowISO } from "@/db/utils/timestamps";

export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  name: string;
  role?: string;
  schoolId?: string;
  classLevel?: string;
}

export interface SignInData {
  emailOrPhone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  tokens?: AuthTokens;
  error?: string;
}

/**
 * Authentication Service
 */
export class AuthService {
  private db: TursoDbService;

  constructor() {
    this.db = TursoDbService.getInstance();
  }

  /**
   * Register a new user
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      const db = await this.db.getDb();

      // Check if email or phone already exists
      if (data.email) {
        const existingEmail = await db
          .select()
          .from(profiles)
          .where(eq(profiles.email, data.email))
          .limit(1);

        if (existingEmail.length > 0) {
          return { success: false, error: "Email already registered" };
        }
      }

      if (data.phone) {
        const existingPhone = await db
          .select()
          .from(profiles)
          .where(eq(profiles.phone, data.phone))
          .limit(1);

        if (existingPhone.length > 0) {
          return { success: false, error: "Phone number already registered" };
        }
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user profile
      const userId = generateId();
      const now = nowISO();

      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: userId,
          email: data.email || null,
          phone: data.phone || null,
          passwordHash,
          name: data.name,
          role: data.role || "student",
          schoolId: data.schoolId || null,
          classLevel: data.classLevel || null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Create tokens
      const tokens = await createTokenPair({
        id: newProfile.id,
        email: newProfile.email || "",
        role: newProfile.role,
      });

      return {
        success: true,
        user: {
          id: newProfile.id,
          email: newProfile.email,
          phone: newProfile.phone,
          name: newProfile.name,
          role: newProfile.role,
        },
        tokens,
      };
    } catch (error) {
      console.error("SignUp error:", error);
      return { success: false, error: "Failed to create account" };
    }
  }

  /**
   * Authenticate a user with email/phone and password
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      const db = await this.db.getDb();

      // Find user by email or phone
      const [user] = await db
        .select()
        .from(profiles)
        .where(
          or(
            eq(profiles.email, data.emailOrPhone),
            eq(profiles.phone, data.emailOrPhone)
          )
        )
        .limit(1);

      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }

      // Check if account is active
      if (!user.isActive) {
        return { success: false, error: "Account is deactivated" };
      }

      // Verify password
      if (!user.passwordHash) {
        return { success: false, error: "Password not set for this account" };
      }

      const passwordValid = await verifyPassword(
        data.password,
        user.passwordHash
      );
      if (!passwordValid) {
        return { success: false, error: "Invalid credentials" };
      }

      // Create tokens
      const tokens = await createTokenPair({
        id: user.id,
        email: user.email || "",
        role: user.role,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      console.error("SignIn error:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  /**
   * Verify an access token and return user info
   */
  async verifySession(token: string): Promise<AuthResult> {
    try {
      const payload = await verifyAccessToken(token);
      if (!payload) {
        return { success: false, error: "Invalid or expired token" };
      }

      const db = await this.db.getDb();
      const [user] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, payload.sub))
        .limit(1);

      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (!user.isActive) {
        return { success: false, error: "Account is deactivated" };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error("Session verification error:", error);
      return { success: false, error: "Session verification failed" };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = await verifyRefreshToken(refreshToken);
      if (!payload) {
        return { success: false, error: "Invalid or expired refresh token" };
      }

      const db = await this.db.getDb();
      const [user] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, payload.sub))
        .limit(1);

      if (!user || !user.isActive) {
        return { success: false, error: "User not found or deactivated" };
      }

      // Create new tokens
      const tokens = await createTokenPair({
        id: user.id,
        email: user.email || "",
        role: user.role,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return { success: false, error: "Token refresh failed" };
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await this.db.getDb();

      const [user] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      if (!user || !user.passwordHash) {
        return { success: false, error: "User not found" };
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return { success: false, error: "Current password is incorrect" };
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await db
        .update(profiles)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: nowISO(),
        })
        .where(eq(profiles.id, userId));

      return { success: true };
    } catch (error) {
      console.error("Password change error:", error);
      return { success: false, error: "Failed to change password" };
    }
  }

  /**
   * Admin: Set password for a user (bypass current password check)
   */
  async adminSetPassword(
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await this.db.getDb();

      const newPasswordHash = await hashPassword(newPassword);

      const [updated] = await db
        .update(profiles)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: nowISO(),
        })
        .where(eq(profiles.id, userId))
        .returning();

      if (!updated) {
        return { success: false, error: "User not found" };
      }

      return { success: true };
    } catch (error) {
      console.error("Admin set password error:", error);
      return { success: false, error: "Failed to set password" };
    }
  }

  /**
   * Get user by token payload
   */
  async getUserFromToken(payload: TokenPayload): Promise<AuthUser | null> {
    try {
      const db = await this.db.getDb();
      const [user] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, payload.sub))
        .limit(1);

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      console.error("Get user from token error:", error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
