import "server-only";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import readline from "node:readline";
import { FIVE_K_OS_ROOT } from "./five-k-os";

// Runs Claude Code headlessly in the local 5k-os clone, so jobs use 5k-os skills,
// scripts and AGENTS.md exactly as they do in VS Code. It signs in with the
// machine's Claude Code login (or ANTHROPIC_API_KEY when that is set).

export type JobStatus = "running" | "done" | "failed";

export type Job = {
  id: string;
  slug: string;
  kind: "brand-kit";
  status: JobStatus;
  startedAt: number;
  finishedAt?: number;
  steps: string[];
  summary?: string;
  error?: string;
};

export type JobView = Omit<Job, "slug" | "kind">;

const MAX_RUN_MS = 15 * 60 * 1000;

// Survives dev-server hot reloads; jobs are per machine and in memory only.
const globalJobs = globalThis as { __claudeCodeJobs?: Map<string, Job> };
const jobs = (globalJobs.__claudeCodeJobs ??= new Map());

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function runningJob(slug: string, kind: Job["kind"]): Job | undefined {
  return [...jobs.values()].find((job) => job.slug === slug && job.kind === kind && job.status === "running");
}

export function startClaudeCodeJob(input: {
  slug: string;
  kind: Job["kind"];
  prompt: string;
  allowedTools: string[];
  maxTurns: number;
  // Decides whether the run produced what it should; returns an error message if not.
  verify: (job: Job) => Promise<string | null>;
  cleanup: (job: Job) => Promise<void>;
}): Job {
  const job: Job = {
    id: randomUUID(),
    slug: input.slug,
    kind: input.kind,
    status: "running",
    startedAt: Date.now(),
    steps: ["Starting Claude Code in 5k-os"],
  };
  jobs.set(job.id, job);

  // Don't hand a parent Claude Code session's runtime markers to the job. Run the
  // app from a normal terminal; inside a Claude Code session, Claude Code warns that
  // nested sessions can crash each other.
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key === "CLAUDECODE" || key.startsWith("CLAUDE_CODE_")) delete env[key];
  }

  const child = spawn(
    /*turbopackIgnore: true*/ process.env.CLAUDE_BIN || "claude",
    [
      "-p",
      input.prompt,
      "--output-format",
      "stream-json",
      "--verbose",
      "--allowedTools",
      input.allowedTools.join(","),
      "--max-turns",
      String(input.maxTurns),
    ],
    { cwd: FIVE_K_OS_ROOT, env, stdio: ["ignore", "pipe", "pipe"] },
  );

  let resultError: string | null = null;
  let stderr = "";
  const timer = setTimeout(() => child.kill("SIGTERM"), MAX_RUN_MS);

  readline.createInterface({ input: child.stdout }).on("line", (line) => {
    let event: StreamEvent;
    try {
      event = JSON.parse(line) as StreamEvent;
    } catch {
      return;
    }
    if (event.type === "assistant") {
      for (const block of event.message?.content ?? []) {
        if (block.type === "tool_use") job.steps.push(describeTool(block.name, block.input ?? {}));
      }
    } else if (event.type === "result") {
      job.summary = typeof event.result === "string" ? event.result.trim() : undefined;
      if (event.is_error || event.subtype !== "success") {
        resultError = job.summary || `Claude Code stopped early (${event.subtype ?? "error"}).`;
      }
    }
  });
  child.stderr.on("data", (chunk: Buffer) => {
    stderr = (stderr + chunk.toString()).slice(-2000);
  });

  const finish = async (spawnError?: Error) => {
    clearTimeout(timer);
    let error: string | null = null;
    if (spawnError) {
      error = "Couldn't start Claude Code. Check that the claude CLI is installed and signed in.";
    } else if (resultError) {
      error = resultError;
    } else if (child.exitCode !== 0) {
      error = stderr.trim() || `Claude Code exited with code ${child.exitCode ?? child.signalCode}.`;
    } else {
      error = await input.verify(job);
    }
    job.status = error ? "failed" : "done";
    job.error = error ?? undefined;
    job.finishedAt = Date.now();
    await input.cleanup(job).catch(() => undefined);
  };
  child.once("error", (spawnError) => void finish(spawnError));
  child.once("close", () => void finish());

  return job;
}

export function toJobView(job: Job): JobView {
  const { id, status, startedAt, finishedAt, steps, summary, error } = job;
  return { id, status, startedAt, finishedAt, steps, summary, error };
}

type StreamEvent = {
  type: string;
  subtype?: string;
  is_error?: boolean;
  result?: unknown;
  message?: { content?: { type: string; name: string; input?: Record<string, unknown> }[] };
};

function describeTool(name: string, input: Record<string, unknown>): string {
  const file = typeof input.file_path === "string" ? path.basename(input.file_path) : null;
  const command = typeof input.command === "string" ? input.command : "";
  switch (name) {
    case "Skill":
      return "Loading the 5K skill";
    case "Read":
      if (!file) return "Reading files";
      if (file === "SKILL.md") return "Reading the brand kit skill";
      return file.endsWith(".png") ? `Looking at ${file}` : `Reading ${file}`;
    case "Write":
    case "Edit":
      return file ? `Writing ${file}` : "Writing files";
    case "Bash":
      if (command.includes("extract_pdf_images")) return "Pulling images out of the PDF";
      if (command.includes("finalize_brand_kit")) return "Checking and saving the brand kit";
      return "Running a command";
    case "Glob":
    case "Grep":
      return "Looking through 5k-os";
    default:
      return `Using ${name}`;
  }
}
