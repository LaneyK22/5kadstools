"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function readableOn(hex: string): string {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return "#111116";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return luminance > 0.6 ? "#111116" : "#ffffff";
}

export function ColorSwatch({
  name,
  hex,
  role,
  usage,
}: {
  name: string;
  hex: string;
  role: string;
  usage: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={copy}
        title={`Copy ${hex}`}
        style={{ backgroundColor: hex, color: readableOn(hex) }}
        className="group flex h-24 w-full items-end justify-between p-3 text-left"
      >
        <span className="font-mono text-xs font-medium">{hex.toUpperCase()}</span>
        {copied ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4 opacity-0 transition group-hover:opacity-80" />
        )}
      </button>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="shrink-0 text-[11px] uppercase tracking-wider text-ink-muted">{role}</p>
        </div>
        <p className="mt-1 line-clamp-3 text-xs leading-5 text-ink-muted">{usage}</p>
      </div>
    </div>
  );
}
