import Image from "next/image";
import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import type { UploadState } from "@/app/(app)/c/[client]/brand/actions";
import { LOGO_KINDS, type BrandAsset, type StoredBrandKit } from "@/lib/brand-kit-schema";
import { ColorSwatch } from "./color-swatch";
import { LogoUpload } from "./upload-forms";

type UploadAction = (state: UploadState, formData: FormData) => Promise<UploadState>;

const assetUrl = (slug: string, file: string) => `/c/${slug}/brand/assets/${file}`;

function googleFontHref(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}&display=swap`;
}

export function BrandKitView({
  slug,
  kit,
  logoAction,
}: {
  slug: string;
  kit: StoredBrandKit;
  logoAction: UploadAction;
}) {
  const logos = kit.assets.filter((asset) => LOGO_KINDS.includes(asset.kind));
  const graphics = kit.assets.filter((asset) => asset.kind === "icon" || asset.kind === "pattern");
  const photos = kit.assets.filter((asset) => asset.kind === "photo");

  return (
    <div className="space-y-6">
      {kit.fonts.map((font) => (
        <link key={font.family} rel="stylesheet" href={googleFontHref(font.family)} precedence="default" />
      ))}

      <p className="max-w-3xl text-[15px] leading-7">{kit.summary}</p>

      <Panel
        title="Logos"
        aside={<LogoUpload action={logoAction} />}
        footer={
          kit.logo.usageRules.length + kit.logo.donts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <RuleList title="Use it like this" items={[
                ...kit.logo.usageRules,
                ...(kit.logo.clearSpace ? [`Clear space: ${kit.logo.clearSpace}`] : []),
                ...(kit.logo.minimumSize ? [`Minimum size: ${kit.logo.minimumSize}`] : []),
              ]} />
              <RuleList title="Don't" items={kit.logo.donts} tone="warn" />
            </div>
          ) : null
        }
      >
        {logos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {logos.map((logo) => (
              <LogoTile key={logo.file} slug={slug} asset={logo} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-sm text-ink-muted">
            The logo in this guide is vector artwork, so it couldn&apos;t be pulled out as an image. Add the logo
            files (PNG or SVG) to use them in ads.
          </p>
        )}
      </Panel>

      <Panel title="Colors">
        {kit.colors.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kit.colors.map((color) => (
              <ColorSwatch key={`${color.name}-${color.hex}`} {...color} />
            ))}
          </div>
        ) : (
          <Empty>The guide doesn&apos;t define brand colors.</Empty>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Typography">
          {kit.fonts.length > 0 ? (
            <ul className="divide-y divide-line">
              {kit.fonts.map((font) => (
                <li key={font.family} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted">{font.role}</p>
                  <p className="mt-1 text-3xl" style={{ fontFamily: `"${font.family}", var(--font-geist-sans)` }}>
                    {font.family}
                  </p>
                  {font.weights.length > 0 ? (
                    <p className="mt-1 text-xs text-ink-muted">{font.weights.join(" · ")}</p>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{font.usage}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>The guide doesn&apos;t name its fonts.</Empty>
          )}
        </Panel>

        <Panel title="Voice">
          {kit.voice.traits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {kit.voice.traits.map((trait) => (
                <span key={trait} className="rounded-full bg-canvas px-3 py-1 text-sm">
                  {trait}
                </span>
              ))}
            </div>
          ) : null}
          <RuleList items={kit.voice.guidance} className="mt-4" />
          {kit.voice.examplePhrases.length > 0 ? (
            <div className="mt-4 space-y-2">
              {kit.voice.examplePhrases.map((phrase) => (
                <p key={phrase} className="border-l-2 border-magenta pl-3 text-sm italic">
                  {phrase}
                </p>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Imagery">
          <p className="text-sm leading-6">{kit.imagery.style}</p>
          <RuleList items={kit.imagery.guidance} className="mt-4" />
          {photos.length + graphics.length > 0 ? (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[...photos, ...graphics].map((asset) => (
                <div key={asset.file} className="relative aspect-square overflow-hidden rounded-lg bg-canvas">
                  <Image
                    src={assetUrl(slug, asset.file)}
                    alt={asset.description}
                    title={asset.description}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </Panel>

        <Panel title="Rules for ads">
          {kit.adGuidance.length > 0 ? (
            <RuleList items={kit.adGuidance} />
          ) : (
            <Empty>The guide has no rules specific to ads.</Empty>
          )}
        </Panel>
      </div>

      {kit.missing.length > 0 ? (
        <section className="rounded-2xl border border-amber-300/60 bg-amber-50 p-6">
          <h2 className="font-semibold tracking-tight">Not in the guide</h2>
          <p className="mt-1 text-sm text-ink-muted">Ask the client for these, or decide them before designing ads.</p>
          <RuleList items={kit.missing} className="mt-4" />
        </section>
      ) : null}

      <a
        href={assetUrl(slug, "source.pdf")}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
      >
        <FileText className="size-4" />
        Open the original guide ({kit.sourcePdf})
      </a>
    </div>
  );
}

function LogoTile({ slug, asset }: { slug: string; asset: BrandAsset }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-2">
        {["bg-white", "bg-chrome"].map((background) => (
          <div key={background} className={`relative h-32 ${background}`}>
            <Image
              src={assetUrl(slug, asset.file)}
              alt={asset.description}
              fill
              unoptimized
              className="object-contain p-5"
            />
          </div>
        ))}
      </div>
      <figcaption className="border-t border-line bg-surface px-3 py-2 text-xs text-ink-muted">
        <span className="font-medium text-ink">{asset.kind.replace(/-/g, " ")}</span> · {asset.width}×{asset.height}px
      </figcaption>
    </figure>
  );
}

function Panel({
  title,
  aside,
  footer,
  children,
}: {
  title: string;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-4 px-6 pt-5">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {aside}
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
      {footer ? <div className="border-t border-line px-6 py-5">{footer}</div> : null}
    </section>
  );
}

function RuleList({
  title,
  items,
  tone = "default",
  className = "",
}: {
  title?: string;
  items: string[];
  tone?: "default" | "warn";
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      {title ? <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{title}</p> : null}
      <ul className={`${title ? "mt-2" : ""} space-y-1.5`}>
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-6">
            <span
              className={`mt-2.5 size-1.5 shrink-0 rounded-full ${tone === "warn" ? "bg-magenta" : "bg-ink-muted/50"}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-muted">{children}</p>;
}
