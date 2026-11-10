import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-magenta">Not found</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        That page doesn&apos;t exist, or it isn&apos;t one of your clients.
      </h1>
      <Link href="/" className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink">
        Back to your clients
      </Link>
    </main>
  );
}
