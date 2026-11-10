import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { OAUTH_STATE_COOKIE } from "@/config/app";
import { ALLOWED_DOMAIN, findMember } from "@/config/team";
import { googleRedirectUri, readIdTokenClaims } from "@/lib/google";
import { startSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("google-not-configured");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const jar = await cookies();
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth" });
  if (!code || !state || state !== expectedState) return fail("state");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return fail("google");

  const { id_token: idToken } = (await tokenResponse.json()) as { id_token?: string };
  if (!idToken) return fail("google");

  const claims = readIdTokenClaims(idToken);
  if (claims.aud !== clientId || !claims.email_verified || claims.hd !== ALLOWED_DOMAIN) {
    return fail("domain");
  }
  if (!findMember(claims.email)) return fail("not-on-team");

  await startSession(claims.email);
  return NextResponse.redirect(new URL("/", request.url));
}
