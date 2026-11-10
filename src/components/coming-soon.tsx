import type { Section } from "@/config/sections";
import { MilestonePill, PageHeader } from "./page-header";

export function ComingSoon({ section, eyebrow }: { section: Section; eyebrow: string }) {
  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      <PageHeader
        eyebrow={eyebrow}
        title={section.label}
        description={section.summary}
        aside={<MilestonePill label={section.milestone} />}
      />
      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="relative border-b border-line px-8 py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-linear-to-br from-magenta/15 to-ember/10 blur-3xl"
          />
          <p className="relative text-sm font-medium">Being built</p>
          <p className="relative mt-1 max-w-xl text-sm text-ink-muted">
            This section is on the Q4 roadmap. Here is what it will do when it ships.
          </p>
        </div>
        <ol className="divide-y divide-line">
          {section.plans.map((plan, index) => (
            <li key={plan} className="flex items-start gap-4 px-8 py-5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-canvas font-mono text-xs text-ink-muted">
                {index + 1}
              </span>
              <span className="text-sm leading-6">{plan}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
