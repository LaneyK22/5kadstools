import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/config/app";

// Optimistic check only: send visitors with no session cookie to the login page.
// Pages still verify the session and client access on the server.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|brand/).*)"],
};
