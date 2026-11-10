import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { devSignIn } from "@/app/actions";
import { BrandMark } from "@/components/brand-mark";
import { TEAM } from "@/config/team";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  "google-not-configured": "Google sign-in isn't set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  state: "That sign-in link expired. Try again.",
  google: "Google didn't complete the sign-in. Try again.",
  domain: "Sign in with your 5k.co Google account.",
  "not-on-team": "Your account isn't on the team list yet. Ask Laney to add you.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden bg-chrome px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-linear-to-r from-magenta/25 to-ember/20 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <BrandMark size="lg" />
        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-chrome-text">
          Design ads that perform.
        </h1>
        <p className="mt-2 text-sm text-chrome-muted">
          Brand kits, creative studio, swipe files and approvals for every 5K client.
        </p>
        <Suspense fallback={<div className="mt-8 h-11 rounded-lg bg-chrome-raised" />}>
          <SignInOptions searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function SignInOptions({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  if (await getCurrentUser()) redirect("/");

  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  const googleReady = Boolean(process.env.GOOGLE_CLIENT_ID);
  const devMode = process.env.NODE_ENV !== "production";

  return (
    <div className="mt-8 space-y-4">
      {message ? (
        <p className="rounded-lg border border-magenta/40 bg-magenta/10 px-3 py-2 text-sm text-chrome-text">
          {message}
        </p>
      ) : null}

      {googleReady ? (
        <a
          href="/api/auth/google"
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-ink transition hover:bg-white/90"
        >
          Continue with Google
        </a>
      ) : (
        <p className="text-xs text-chrome-muted">
          Google sign-in turns on once GOOGLE_CLIENT_ID is set.
        </p>
      )}

      {devMode ? (
        <div className="rounded-xl border border-dashed border-chrome-line p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-chrome-muted">
            Local dev sign-in
          </p>
          <div className="mt-3 space-y-2">
            {TEAM.map((member) => (
              <form key={member.email} action={devSignIn}>
                <input type="hidden" name="email" value={member.email} />
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-between rounded-lg bg-chrome-raised px-3 text-sm text-chrome-text transition hover:bg-chrome-line"
                >
                  <span>{member.name}</span>
                  <span className="text-chrome-muted">{member.email}</span>
                </button>
              </form>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
