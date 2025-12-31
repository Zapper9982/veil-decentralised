import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getUserRegistrationStatus } from "@/lib/userStatus"

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register")


    if (isAuthPage) {
      if (isAuth) {
        // Check registration status
        const userId = token?.sub;
        if (userId) {
          const regStatus = await getUserRegistrationStatus(userId);
          if (!regStatus) {
            return NextResponse.redirect(new URL("/verification", req.url));
          }
          // If registered, redirect based on role
          if (regStatus === "patient") {
            return NextResponse.redirect(new URL("/dashboard/patient/profile", req.url));
          } else if (regStatus === "doctor") {
            return NextResponse.redirect(new URL("/dashboard/doctor", req.url));
          }
        }
        // Fallback to post-login-redirect if no status determined
        return NextResponse.redirect(new URL("/post-login-redirect", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/login", "/register"],
}
