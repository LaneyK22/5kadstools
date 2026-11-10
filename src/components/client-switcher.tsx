"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export type ClientOption = { slug: string; name: string };

export function ClientSwitcher({ clients }: { clients: ClientOption[] }) {
  const params = useParams<{ client?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = clients.find((client) => client.slug === params.client);
  // Switching clients keeps you in the same section: /c/<client>/<section>
  const section = params.client ? (pathname.split("/")[3] ?? "brand") : "brand";
  const hrefFor = (slug: string) => `/c/${slug}/${section}`;
  const filtered = clients.filter((client) =>
    client.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function openMenu() {
    setQuery("");
    setHighlighted(0);
    setOpen(true);
  }

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else openMenu();
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && filtered[highlighted]) {
      event.preventDefault();
      setOpen(false);
      router.push(hrefFor(filtered[highlighted].slug));
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-72 items-center gap-2.5 rounded-lg border border-chrome-line bg-chrome-raised px-2.5 text-left text-sm text-chrome-text transition hover:border-chrome-muted/50"
      >
        {current ? <ClientAvatar name={current.name} /> : null}
        <span className="flex-1 truncate">{current?.name ?? "Choose a client"}</span>
        <kbd className="rounded border border-chrome-line px-1.5 font-mono text-[10px] text-chrome-muted">
          ⌘K
        </kbd>
        <ChevronsUpDown className="size-3.5 text-chrome-muted" />
      </button>

      {open ? (
        <div className="absolute left-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-chrome-line bg-chrome-raised shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-chrome-line px-3">
            <Search className="size-4 text-chrome-muted" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlighted(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Find a client"
              className="h-11 flex-1 bg-transparent text-sm text-chrome-text outline-none placeholder:text-chrome-muted"
            />
          </div>
          <ul role="listbox" className="max-h-80 overflow-y-auto p-1.5">
            {filtered.map((client, index) => (
              <li key={client.slug} role="option" aria-selected={client.slug === current?.slug}>
                <Link
                  href={hrefFor(client.slug)}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-chrome-text ${
                    index === highlighted ? "bg-chrome-line" : ""
                  }`}
                >
                  <ClientAvatar name={client.name} />
                  <span className="flex-1 truncate">{client.name}</span>
                  {client.slug === current?.slug ? <Check className="size-4 text-magenta" /> : null}
                </Link>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-2.5 py-6 text-center text-sm text-chrome-muted">No matching clients</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ClientAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter((word) => /^[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-md bg-linear-to-br from-magenta to-ember font-semibold text-white ${
        size === "lg" ? "size-9 text-sm" : "size-5 text-[9px]"
      }`}
    >
      {initials}
    </span>
  );
}
