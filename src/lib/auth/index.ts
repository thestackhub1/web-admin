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
} from './middleware';

export { getSessionToken } from './get-session-token';

