import { notFound } from "next/navigation";
import { ClientNav } from "@/components/client-nav";
import { requireClientAccess } from "@/lib/auth";
import { getClientProfile } from "@/lib/five-k-os";

export default async function ClientLayout({ children, params }: LayoutProps<"/c/[client]">) {
  const { client } = await params;
  await requireClientAccess(client);
  const profile = await getClientProfile(client);
  if (!profile) notFound();

  return (
    <>
      <ClientNav slug={profile.slug} name={profile.name} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </>
  );
}
