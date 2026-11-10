import { authorizeClient } from "@/lib/auth";
import { readBrandKitFile } from "@/lib/brand-kit-store";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  svg: "image/svg+xml",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};

// Serves brand kit files from 5k-os to signed-in people who have this client.
export async function GET(_request: Request, { params }: RouteContext<"/c/[client]/brand/assets/[file]">) {
  const { client, file } = await params;
  if (!(await authorizeClient(client))) return new Response("Not found", { status: 404 });

  const data = await readBrandKitFile(client, file);
  if (!data) return new Response("Not found", { status: 404 });

  const extension = file.split(".").pop() ?? "";
  const headers = new Headers({
    "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
    "Cache-Control": "private, max-age=60",
    "X-Content-Type-Options": "nosniff",
  });
  // An SVG can carry script; serve it inert.
  if (extension === "svg") headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");

  return new Response(new Uint8Array(data), { headers });
}
