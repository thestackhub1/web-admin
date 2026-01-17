import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Get JWT secret for verification
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verify access token and extract payload
 */
async function verifyToken(token: string): Promise<{
  sub: string;
  email: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret(), {
      issuer: "abhedya-admin",
      audience: "abhedya-users",
    });
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // API routes use their own authentication (Bearer token in Authorization header)
  // Don't apply cookie-based auth middleware to them
  if (pathname.startsWith("/api/")) {
    return response;
  }

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/signup", "/auth/callback"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Get token from cookie (for server-side session management)
  const accessToken = request.cookies.get("abhedya_access_token")?.value;

  let user: { sub: string; email: string; role: string } | null = null;
  if (accessToken) {
    user = await verifyToken(accessToken);
  }

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // STRICT RBAC: Only admin and teacher roles are allowed
  const allowedRoles = ["admin", "teacher", "school_admin"];
  const isAllowed = user && allowedRoles.includes(user.role);

  // If authenticated but not an allowed role (e.g. student), redirect to login
  if (user && !isAllowed && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "access_denied");
    url.searchParams.set("reason", "unauthorized_role");
    return NextResponse.redirect(url);
  }

  // If authenticated (and allowed) and trying to access login/signup, redirect to dashboard
  if (user && isAllowed && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
