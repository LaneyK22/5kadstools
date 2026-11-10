import { authorizeClient } from "@/lib/auth";
import { getJob, toJobView } from "@/lib/claude-code";

// Progress for a Claude Code job, polled by the page that started it.
export async function GET(_request: Request, { params }: RouteContext<"/api/jobs/[id]">) {
  const { id } = await params;
  const job = getJob(id);
  if (!job || !(await authorizeClient(job.slug))) return new Response("Not found", { status: 404 });
  return Response.json(toJobView(job), { headers: { "Cache-Control": "no-store" } });
}
