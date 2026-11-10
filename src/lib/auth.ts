import "server-only";
import { cacheLife } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { findMember, type TeamMember } from "@/config/team";
import { getSession } from "./session";

// Private cache: reads the session cookie at request time, keeps the result in the
// browser only, and lets authenticated pages prefetch.
export async function getCurrentUser(): Promise<TeamMember | null> {
  "use cache: private";
  cacheLife("minutes");
  const { email } = await getSession();
  return email ? (findMember(email) ?? null) : null;
}

export async function requireUser(): Promise<TeamMember> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// For Server Actions and Route Handlers: reads the session directly, never from a cache.
export async function authorizeClient(slug: string): Promise<TeamMember | null> {
  const { email } = await getSession();
  const user = email ? findMember(email) : undefined;
  return user?.clients.includes(slug) ? user : null;
}

// Call from every client page, not only the layout: layouts don't re-run on every navigation.
export async function requireClientAccess(slug: string): Promise<TeamMember> {
  const user = await requireUser();
  if (!user.clients.includes(slug)) notFound();
  return user;
}
