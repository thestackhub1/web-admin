/**
 * JWT Token Utilities
 *
 * Handles JWT token creation, verification, and management.
 * Replaces Supabase Auth with custom JWT implementation.
 */

import { SignJWT, jwtVerify, JWTPayload } from "jose";

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);
const JWT_ISSUER = "abhedya-admin";
const JWT_AUDIENCE = "abhedya-users";

// Token expiry times
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export interface TokenPayload extends JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  type: "access" | "refresh";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Create an access token for a user
 */
export async function createAccessToken(user: {
  id: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "access",
  } as TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Create a refresh token for a user
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const token = await new SignJWT({
    sub: userId,
    type: "refresh",
  } as TokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Create both access and refresh tokens
 */
export async function createTokenPair(user: {
  id: string;
  email: string;
  role: string;
}): Promise<AuthTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(user),
    createRefreshToken(user.id),
  ]);

  // Calculate expiry (1 hour from now)
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return payload as TokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify an access token specifically
 */
export async function verifyAccessToken(
  token: string
): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);

  if (!payload || payload.type !== "access") {
    return null;
  }

  return payload;
}

/**
 * Verify a refresh token specifically
 */
export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);

  if (!payload || payload.type !== "refresh") {
    return null;
  }

  return payload;
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
