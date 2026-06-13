import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecrypt } from "jose";

const protectedRoutes = ["/dashboard", "/transactions"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requiresAuth = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (requiresAuth) {
    // Get session token from cookies
    const token = req.cookies.get("next-auth.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decrypt JWE token (NextAuth v5 uses encrypted JWTs)
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "");
      await jwtDecrypt(token, secret);
    } catch {
      // Invalid/expired token - redirect to login
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*"],
};
