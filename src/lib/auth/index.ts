/**
 * Authentication utilities
 *
 * Exports all authentication-related functions and types
 */

export {
  authenticateRequest,
  isAuthContext,
  type AuthContext,
  type AuthUser,
  type AuthProfile,
} from "./middleware";

export { getSessionToken } from "./get-session-token";

// JWT utilities
export {
  createAccessToken,
  createRefreshToken,
  createTokenPair,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
  type TokenPayload,
  type AuthTokens,
} from "./jwt";

// Password utilities
export {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateRandomPassword,
} from "./password";

// Auth service
export { authService, AuthService, type SignUpData, type SignInData, type AuthResult } from "./auth.service";

// Security service (for RLS-like authorization)
export { SecurityService, canAccess, canModify, filterByAccess } from "./security";
