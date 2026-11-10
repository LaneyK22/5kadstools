"use server";

import { redirect } from "next/navigation";
import { findMember } from "@/config/team";
import { endSession, startSession } from "@/lib/session";

// Local development only: sign in as a team member without Google.
export async function devSignIn(formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev sign-in is disabled in production");
  }
  const email = String(formData.get("email") ?? "");
  if (!findMember(email)) redirect("/login?error=not-on-team");
  await startSession(email);
  redirect("/");
}

export async function signOut() {
  await endSession();
  redirect("/login");
}
