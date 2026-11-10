import "server-only";
import type { NextRequest } from "next/server";

export type GoogleIdClaims = {
  aud: string;
  email: string;
  email_verified: boolean;
  hd?: string;
  name?: string;
};

export function googleRedirectUri(request: NextRequest): string {
  const origin = process.env.APP_URL || request.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
}

// The id_token comes straight from Google's token endpoint over TLS, so the claims are
// read without a signature check (OpenID Connect Core 1.0, section 3.1.3.7).
export function readIdTokenClaims(idToken: string): GoogleIdClaims {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Malformed id_token");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GoogleIdClaims;
}
