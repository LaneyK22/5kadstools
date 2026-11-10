import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import type { TeamMember } from "@/config/team";
import { BrandMark } from "./brand-mark";
import { ClientSwitcher, type ClientOption } from "./client-switcher";

export function TopBar({ user, clients }: { user: TeamMember; clients: ClientOption[] }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-chrome-line bg-chrome px-4">
      <Link href="/" className="flex w-52 items-center">
        <BrandMark />
      </Link>
      <ClientSwitcher clients={clients} />
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-chrome-muted">{user.name}</span>
        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            className="grid size-8 place-items-center rounded-lg text-chrome-muted transition hover:bg-chrome-raised hover:text-chrome-text"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}

export function TopBarFallback() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-chrome-line bg-chrome px-4">
      <div className="flex w-52 items-center">
        <BrandMark />
      </div>
      <div className="h-9 w-72 animate-pulse rounded-lg bg-chrome-raised" />
    </header>
  );
}
