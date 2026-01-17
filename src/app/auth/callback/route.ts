import { NextResponse } from "next/server";

/**
 * OAuth Callback Route
 * 
 * This route handles OAuth callbacks. Since we're using JWT-based auth,
 * this is now a placeholder for future OAuth provider integrations.
 * 
 * For now, it just redirects to the dashboard or login page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  // For future OAuth integration, handle code exchange here
  // For now, redirect to dashboard if authenticated or login if not
  return NextResponse.redirect(`${origin}${next}`);
}
