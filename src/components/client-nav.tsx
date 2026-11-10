"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  GalleryHorizontalEnd,
  Palette,
  Shapes,
  Sparkles,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import { SECTIONS, type Section, type SectionKey } from "@/config/sections";
import { ClientAvatar } from "./client-switcher";

const ICONS: Record<SectionKey, LucideIcon> = {
  brand: Palette,
  studio: Sparkles,
  "live-ads": Activity,
  swipe: GalleryHorizontalEnd,
  competitors: Telescope,
  approvals: BadgeCheck,
  libraries: Shapes,
};

export function ClientNav({ slug, name }: { slug: string; name: string }) {
  const pathname = usePathname();
  const clientSections = SECTIONS.filter((section) => section.group === "client");
  const sharedSections = SECTIONS.filter((section) => section.group === "shared");

  const item = (section: Section) => {
    const href = `/c/${slug}/${section.key}`;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const Icon = ICONS[section.key];
    return (
      <li key={section.key}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition ${
            active
              ? "bg-chrome-raised text-chrome-text"
              : "text-chrome-muted hover:bg-chrome-raised/60 hover:text-chrome-text"
          }`}
        >
          {active ? (
            <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-magenta" />
          ) : null}
          <Icon className={`size-4 ${active ? "text-magenta" : ""}`} strokeWidth={1.75} />
          {section.label}
        </Link>
      </li>
    );
  };

  return (
    <nav className="flex w-60 shrink-0 flex-col border-r border-chrome-line bg-chrome px-3 py-5">
      <div className="flex items-center gap-3 px-2">
        <ClientAvatar name={name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-chrome-text">{name}</p>
          <p className="truncate font-mono text-[11px] text-chrome-muted">{slug}</p>
        </div>
      </div>

      <p className="mt-8 px-3 text-[11px] font-medium uppercase tracking-wider text-chrome-muted/70">
        Workspace
      </p>
      <ul className="mt-2 space-y-0.5">{clientSections.map(item)}</ul>

      <p className="mt-8 px-3 text-[11px] font-medium uppercase tracking-wider text-chrome-muted/70">
        Shared
      </p>
      <ul className="mt-2 space-y-0.5">{sharedSections.map(item)}</ul>

      <p className="mt-auto flex items-center gap-2 px-3 text-[11px] text-chrome-muted">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Reading from 5k-os
      </p>
    </nav>
  );
}
