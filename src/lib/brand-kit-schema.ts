// The brand kit the 5k-brand-kit skill writes to clients/<slug>/design/brand-kit/brand-kit.json.
// Field rules: 5k-os/5k/sops/design/brand-kit/references/brand-kit-format.md

export type AssetKind =
  | "primary-logo"
  | "secondary-logo"
  | "logo-mark"
  | "icon"
  | "pattern"
  | "photo"
  | "uploaded-logo";

export type BrandAsset = {
  file: string;
  kind: AssetKind;
  description: string;
  width: number;
  height: number;
};

export type StoredBrandKit = {
  version: 1;
  brandName: string;
  summary: string;
  colors: {
    name: string;
    hex: string;
    role: "primary" | "secondary" | "accent" | "neutral" | "background" | "text";
    usage: string;
  }[];
  fonts: { family: string; role: "heading" | "body" | "accent" | "other"; weights: string[]; usage: string }[];
  logo: { usageRules: string[]; clearSpace: string | null; minimumSize: string | null; donts: string[] };
  voice: { traits: string[]; guidance: string[]; examplePhrases: string[] };
  imagery: { style: string; guidance: string[] };
  adGuidance: string[];
  missing: string[];
  sourcePdf: string;
  extractedAt: string;
  model: string;
  assets: BrandAsset[];
};

export const LOGO_KINDS: AssetKind[] = ["primary-logo", "secondary-logo", "logo-mark", "uploaded-logo"];
