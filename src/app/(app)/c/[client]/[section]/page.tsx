import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";
import { findSection } from "@/config/sections";
import { requireClientAccess } from "@/lib/auth";
import { getClientProfile } from "@/lib/five-k-os";

export default async function SectionPage({ params }: PageProps<"/c/[client]/[section]">) {
  const { client, section: key } = await params;
  await requireClientAccess(client);
  const section = findSection(key);
  const profile = await getClientProfile(client);
  if (!section || !profile) notFound();

  return (
    <ComingSoon
      section={section}
      eyebrow={section.group === "shared" ? "Shared across clients" : profile.name}
    />
  );
}
