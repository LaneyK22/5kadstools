import { Suspense, type ReactNode } from "react";
import { TopBar, TopBarFallback } from "@/components/top-bar";
import { requireUser } from "@/lib/auth";
import { getClientProfiles } from "@/lib/five-k-os";

// Only the top bar waits on the session here. Pages check the session and client
// access themselves, behind their own loading.tsx boundaries.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Suspense fallback={<TopBarFallback />}>
        <SessionTopBar />
      </Suspense>
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}

async function SessionTopBar() {
  const user = await requireUser();
  const clients = await getClientProfiles(user.clients);
  return <TopBar user={user} clients={clients.map(({ slug, name }) => ({ slug, name }))} />;
}
