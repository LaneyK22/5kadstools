import "server-only";
import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";
import { SESSION_COOKIE } from "@/config/app";

type SessionData = { email?: string };

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function password(): string {
  const value = process.env.SESSION_PASSWORD;
  if (!value || value.length < 32) {
    throw new Error("SESSION_PASSWORD must be set to at least 32 characters");
  }
  return value;
}

export async function getSession(): Promise<SessionData> {
  const sealed = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sealed) return {};
  try {
    return await unsealData<SessionData>(sealed, { password: password(), ttl: MAX_AGE_SECONDS });
  } catch {
    return {};
  }
}

export async function startSession(email: string): Promise<void> {
  const sealed = await sealData({ email } satisfies SessionData, {
    password: password(),
    ttl: MAX_AGE_SECONDS,
  });
  (await cookies()).set(SESSION_COOKIE, sealed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
