import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

// Use Edge-safe auth (no DB/Node.js modules) for middleware
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const protectedPaths = ["/dashboard", "/tasks", "/calendar"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/calendar/:path*"],
};
