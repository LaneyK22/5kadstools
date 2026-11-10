import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { OAUTH_STATE_COOKIE } from "@/config/app";
import { ALLOWED_DOMAIN } from "@/config/team";
import { googleRedirectUri } from "@/lib/google";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google-not-configured", request.url));
  }

  const state = crypto.randomUUID();
  (await cookies()).set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    hd: ALLOWED_DOMAIN,
    prompt: "select_account",
  }).toString();
  return NextResponse.redirect(url);
}
