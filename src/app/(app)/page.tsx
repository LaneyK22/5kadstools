import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClientAvatar } from "@/components/client-switcher";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getClientProfiles } from "@/lib/five-k-os";

export default async function HomePage() {
  const user = await requireUser();
  const clients = await getClientProfiles(user.clients);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-10 py-10">
        <PageHeader
          eyebrow={`Welcome back, ${user.name}`}
          title="Your clients"
          description="Pick a client to open their workspace: brand guidelines, creative studio, swipe file and more."
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <li key={client.slug}>
              <Link
                href={`/c/${client.slug}/brand`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-magenta/40 hover:shadow-lg hover:shadow-magenta/5"
              >
                <div className="flex items-center gap-3">
                  <ClientAvatar name={client.name} size="lg" />
                  <p className="flex-1 font-semibold tracking-tight">{client.name}</p>
                  <ArrowUpRight className="size-4 text-ink-muted transition group-hover:text-magenta" />
                </div>
                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-ink-muted">
                  {client.summary ?? "No company-info.md in 5k-os yet."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-ink-muted">
                    {client.websitePageCount} website pages
                  </span>
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-ink-muted">
                    {client.hasBrandKit ? "Brand kit ready" : "No brand kit yet"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {clients.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-ink-muted">
            No clients are assigned to you yet.
          </p>
        ) : null}
      </div>
    </main>
  );
}
