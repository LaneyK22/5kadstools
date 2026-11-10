import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrandKitView } from "@/components/brand-kit/brand-kit-view";
import { BrandGuideUpload } from "@/components/brand-kit/upload-forms";
import { MilestonePill, PageHeader } from "@/components/page-header";
import { requireClientAccess } from "@/lib/auth";
import { readBrandKit } from "@/lib/brand-kit-store";
import { runningJob } from "@/lib/claude-code";
import { getClientProfile, type ClientProfile } from "@/lib/five-k-os";
import { refreshBrandKit, uploadBrandGuide, uploadLogos } from "./actions";

const SWATCH_SLOTS = 5;

export default async function BrandPage({ params }: PageProps<"/c/[client]/brand">) {
  const { client } = await params;
  await requireClientAccess(client);
  const [profile, kit] = await Promise.all([getClientProfile(client), readBrandKit(client)]);
  if (!profile) notFound();

  const guideAction = uploadBrandGuide.bind(null, client);
  const logoAction = uploadLogos.bind(null, client);
  const refresh = refreshBrandKit.bind(null, client);
  const runningJobId = runningJob(client, "brand-kit")?.id;

  if (kit) {
    return (
      <div className="mx-auto max-w-6xl px-10 py-10">
        <PageHeader
          eyebrow="Brand guidelines"
          title={kit.brandName || profile.name}
          description={`From ${kit.sourcePdf}, read ${new Date(kit.extractedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}. Saved in 5k-os/clients/${profile.slug}/design/brand-kit.`}
          aside={<BrandGuideUpload action={guideAction} refresh={refresh} runningJobId={runningJobId} compact />}
        />
        <div className="mt-8">
          <BrandKitView slug={profile.slug} kit={kit} logoAction={logoAction} />
        </div>
        <div className="mt-6">
          <CompanyProfile profile={profile} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <PageHeader
        eyebrow="Brand guidelines"
        title={profile.name}
        description={
          <>
            Pulled from <span className="font-mono text-xs">5k-os/clients/{profile.slug}</span>
          </>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="flex flex-col rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Brand kit</h2>
            <MilestonePill label="Milestone 1 · Nov 13" />
          </div>
          <div className="mt-6 flex gap-2">
            {Array.from({ length: SWATCH_SLOTS }, (_, index) => (
              <span key={index} className="size-12 rounded-xl border border-dashed border-line bg-canvas" />
            ))}
          </div>
          <p className="mt-6 text-sm font-medium">No brand kit yet</p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Have a brand guide? Upload it and Claude Code reads it in 5k-os, pulling out the logos, colors, fonts, voice and ad rules.
          </p>
          <div className="mt-5">
            <BrandGuideUpload action={guideAction} refresh={refresh} runningJobId={runningJobId} />
          </div>
        </section>

        <div className="lg:col-span-3">
          <CompanyProfile profile={profile} />
        </div>
      </div>
    </div>
  );
}

function CompanyProfile({ profile }: { profile: ClientProfile }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-semibold tracking-tight">Company profile</h2>
      {profile.sections.length > 0 ? (
        <div className="mt-5 space-y-6">
          {profile.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-ink-muted">{section.title}</h3>
              <div className="prose prose-sm mt-2 max-w-none prose-li:my-0.5 prose-p:leading-6">
                <Markdown remarkPlugins={[remarkGfm]}>{section.body}</Markdown>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink-muted">No company-info.md in 5k-os yet.</p>
      )}
    </section>
  );
}
