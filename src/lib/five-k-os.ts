import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

// Reads client context from a local 5k-os clone. 5k-os stays the source of truth;
// this app never writes to it yet.
export const FIVE_K_OS_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.FIVEK_OS_PATH || path.join(process.cwd(), "..", "5k-os"),
);

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/i;

export type InfoSection = { title: string; body: string };

export type ClientProfile = {
  slug: string;
  name: string;
  summary: string | null;
  sections: InfoSection[];
  websitePageCount: number;
  designFiles: string[];
  hasBrandKit: boolean;
};

export const clientTag = (slug: string) => `client:${slug}`;

export function clientDir(slug: string): string {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`Invalid client folder name: ${slug}`);
  return path.join(FIVE_K_OS_ROOT, "clients", slug);
}

async function readText(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function countMarkdown(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { recursive: true });
    return entries.filter((entry) => entry.endsWith(".md")).length;
  } catch {
    return 0;
  }
}

async function listDesignFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name !== "AGENTS.md" && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseCompanyInfo(markdown: string, fallbackName: string) {
  const lines = markdown.split("\n");
  const heading = lines.find((line) => line.startsWith("# "));
  const name = heading ? heading.slice(2).replace(/\s+company info$/i, "").trim() : fallbackName;

  const sections: InfoSection[] = [];
  let current: InfoSection | null = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      current = { title: line.slice(3).trim(), body: "" };
      sections.push(current);
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  for (const section of sections) section.body = section.body.trim();

  const whoTheyAre = sections.find((section) => /who they are/i.test(section.title));
  const summary = whoTheyAre?.body.split(/\n\s*\n/)[0] ?? null;

  return { name, summary, sections: sections.filter((section) => section.body) };
}

// Cached for a few minutes, so edits in 5k-os show up shortly after they're made.
export async function getClientProfile(slug: string): Promise<ClientProfile | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(clientTag(slug));

  const dir = clientDir(slug);
  try {
    await fs.access(dir);
  } catch {
    return null;
  }

  const [companyInfo, websitePageCount, designFiles, hasBrandKit] = await Promise.all([
    readText(path.join(dir, "company-info.md")),
    countMarkdown(path.join(dir, "website-content")),
    listDesignFiles(path.join(dir, "design")),
    fs
      .access(path.join(dir, "design", "brand-kit", "brand-kit.json"))
      .then(() => true)
      .catch(() => false),
  ]);
  const fallbackName = titleFromSlug(slug);
  const parsed = companyInfo
    ? parseCompanyInfo(companyInfo, fallbackName)
    : { name: fallbackName, summary: null, sections: [] };

  return { slug, ...parsed, websitePageCount, designFiles, hasBrandKit };
}

export async function getClientProfiles(slugs: string[]): Promise<ClientProfile[]> {
  const profiles = await Promise.all(slugs.map((slug) => getClientProfile(slug)));
  return profiles
    .filter((profile): profile is ClientProfile => profile !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
