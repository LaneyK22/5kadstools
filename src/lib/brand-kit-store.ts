import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import type { StoredBrandKit } from "./brand-kit-schema";
import { clientDir } from "./five-k-os";

// A brand kit lives in 5k-os at clients/<slug>/design/brand-kit/, written by the
// 5k-brand-kit skill (5k/sops/design/brand-kit):
//   brand-kit.json   what was read from the guide, plus the saved assets
//   source.pdf       the brand guide
//   assets/*         logos, icons, patterns and photos

const ASSET_NAME = /^[a-z0-9-]+\.(png|svg|jpe?g|webp)$/;
const UPLOAD_DIR = ".brand-kit-upload";
const STAGING_DIR = ".brand-kit-staging";

export const brandKitTag = (slug: string) => `brand-kit:${slug}`;

function designDir(slug: string): string {
  return path.join(clientDir(slug), "design");
}

function kitDir(slug: string): string {
  return path.join(designDir(slug), "brand-kit");
}

export async function readBrandKit(slug: string): Promise<StoredBrandKit | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(brandKitTag(slug));
  try {
    const json = await fs.readFile(path.join(kitDir(slug), "brand-kit.json"), "utf8");
    return JSON.parse(json) as StoredBrandKit;
  } catch {
    return null;
  }
}

// Saves an uploaded guide where Claude Code can read it; returns its path relative to 5k-os.
export async function saveGuideUpload(slug: string, name: string, data: Buffer): Promise<string> {
  const dir = path.join(designDir(slug), UPLOAD_DIR);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), data);
  return `clients/${slug}/design/${UPLOAD_DIR}/${name}`;
}

export async function clearBrandKitWork(slug: string): Promise<void> {
  await Promise.all(
    [UPLOAD_DIR, STAGING_DIR].map((dir) =>
      fs.rm(path.join(designDir(slug), dir), { recursive: true, force: true }),
    ),
  );
}

export async function brandKitUpdatedSince(slug: string, since: number): Promise<boolean> {
  try {
    const stat = await fs.stat(path.join(kitDir(slug), "brand-kit.json"));
    return stat.mtimeMs >= since;
  } catch {
    return false;
  }
}

export async function addUploadedLogos(
  slug: string,
  files: { name: string; data: Buffer; width: number; height: number }[],
): Promise<void> {
  const dir = kitDir(slug);
  const kitPath = path.join(dir, "brand-kit.json");
  const kit = JSON.parse(await fs.readFile(kitPath, "utf8")) as StoredBrandKit;
  await fs.mkdir(path.join(dir, "assets"), { recursive: true });

  let n = kit.assets.filter((asset) => asset.kind === "uploaded-logo").length;
  for (const upload of files) {
    n += 1;
    const extension = path.extname(upload.name).toLowerCase().replace(".jpeg", ".jpg");
    const file = `uploaded-logo-${n}${extension}`;
    await fs.writeFile(path.join(dir, "assets", file), upload.data);
    kit.assets.push({
      file,
      kind: "uploaded-logo",
      description: upload.name,
      width: upload.width,
      height: upload.height,
    });
  }
  await fs.writeFile(kitPath, `${JSON.stringify(kit, null, 2)}\n`);
}

// Returns the file for an asset name or "source.pdf"; null for anything else.
export async function readBrandKitFile(slug: string, name: string): Promise<Buffer | null> {
  const file =
    name === "source.pdf"
      ? path.join(kitDir(slug), "source.pdf")
      : ASSET_NAME.test(name)
        ? path.join(kitDir(slug), "assets", name)
        : null;
  if (!file) return null;
  try {
    return await fs.readFile(file);
  } catch {
    return null;
  }
}
