import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/goals",
  "/analytics",
  "/assistant",
  "/settings",
];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (requiresAuth && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/budgets/:path*", "/goals/:path*", "/analytics/:path*", "/assistant/:path*", "/settings/:path*"],
};
