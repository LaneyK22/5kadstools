"use server";

import path from "node:path";
import { updateTag } from "next/cache";
import sharp from "sharp";
import { authorizeClient } from "@/lib/auth";
import { addUploadedLogos, brandKitTag, brandKitUpdatedSince, clearBrandKitWork, saveGuideUpload } from "@/lib/brand-kit-store";
import { runningJob, startClaudeCodeJob } from "@/lib/claude-code";
import { clientTag } from "@/lib/five-k-os";

export type UploadState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "started"; jobId: string }
  | { status: "done"; message: string };

const MAX_PDF_MB = 30;
const MAX_LOGO_MB = 10;
const LOGO_EXTENSIONS = [".png", ".svg", ".jpg", ".jpeg", ".webp"];
const SKILL_SCRIPTS = "5k/sops/design/brand-kit/scripts";

export async function uploadBrandGuide(
  slug: string,
  _previous: UploadState,
  formData: FormData,
): Promise<UploadState> {
  if (!(await authorizeClient(slug))) {
    return { status: "error", message: "You don't have access to this client." };
  }
  const running = runningJob(slug, "brand-kit");
  if (running) return { status: "started", jobId: running.id };

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a PDF." };
  if (!file.name.toLowerCase().endsWith(".pdf")) return { status: "error", message: "That file isn't a PDF." };
  if (file.size > MAX_PDF_MB * 1024 * 1024) {
    return { status: "error", message: `That PDF is over ${MAX_PDF_MB} MB.` };
  }

  // Keep the name safe to quote in a shell command.
  const sourceName = path.basename(file.name).replace(/[^\w .()-]/g, "_");
  const guidePath = await saveGuideUpload(slug, sourceName, Buffer.from(await file.arrayBuffer()));
  const staging = `clients/${slug}/design/.brand-kit-staging`;

  const job = startClaudeCodeJob({
    slug,
    kind: "brand-kit",
    maxTurns: 40,
    allowedTools: [
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      `Bash(python3 ${SKILL_SCRIPTS}/extract_pdf_images.py:*)`,
      `Bash(python3 ${SKILL_SCRIPTS}/finalize_brand_kit.py:*)`,
    ],
    prompt: `Use the 5k-brand-kit skill (5k/sops/design/brand-kit/SKILL.md) to build the brand kit for clients/${slug} from the brand guide at ${guidePath} (original file name: "${sourceName}").

Run the skill's scripts from the repo root with exactly these relative commands:
python3 ${SKILL_SCRIPTS}/extract_pdf_images.py "${guidePath}" ${staging}
python3 ${SKILL_SCRIPTS}/finalize_brand_kit.py ${staging} clients/${slug}/design --source-name "${sourceName}"

This runs unattended from the 5K Ads app, so don't ask questions.`,
    verify: async (finished) =>
      (await brandKitUpdatedSince(slug, finished.startedAt))
        ? null
        : "Claude Code finished without saving a brand kit." +
          (finished.summary ? ` It said: ${finished.summary}` : ""),
    cleanup: () => clearBrandKitWork(slug),
  });

  return { status: "started", jobId: job.id };
}

// Called by the page once a job finishes, so the new kit shows without waiting on the cache.
export async function refreshBrandKit(slug: string): Promise<void> {
  if (!(await authorizeClient(slug))) return;
  updateTag(brandKitTag(slug));
  updateTag(clientTag(slug));
}

export async function uploadLogos(
  slug: string,
  _previous: UploadState,
  formData: FormData,
): Promise<UploadState> {
  if (!(await authorizeClient(slug))) {
    return { status: "error", message: "You don't have access to this client." };
  }

  const files = formData.getAll("logos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return { status: "error", message: "Choose at least one logo file." };

  const uploads = [];
  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase();
    if (!LOGO_EXTENSIONS.includes(extension)) {
      return { status: "error", message: `${file.name} isn't a PNG, SVG, JPG or WebP.` };
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      return { status: "error", message: `${file.name} is over ${MAX_LOGO_MB} MB.` };
    }
    const data = Buffer.from(await file.arrayBuffer());
    const { width = 0, height = 0 } = await sharp(data).metadata().catch(() => ({ width: 0, height: 0 }));
    if (!width || !height) return { status: "error", message: `${file.name} couldn't be read as an image.` };
    uploads.push({ name: path.basename(file.name), data, width, height });
  }

  try {
    await addUploadedLogos(slug, uploads);
  } catch {
    return { status: "error", message: "Upload the brand guide first, then add logo files." };
  }

  updateTag(brandKitTag(slug));
  return { status: "done", message: `Added ${uploads.length} logo file${uploads.length === 1 ? "" : "s"}.` };
}
