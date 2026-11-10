"use client";

import { useActionState, useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, FileUp, ImagePlus, Loader2, RefreshCw } from "lucide-react";
import type { UploadState } from "@/app/(app)/c/[client]/brand/actions";
import type { JobView } from "@/lib/claude-code";

type UploadAction = (state: UploadState, formData: FormData) => Promise<UploadState>;

const IDLE: UploadState = { status: "idle" };
const POLL_MS = 1500;

// Drop or choose a brand guide PDF. Submitting hands the job to Claude Code in
// 5k-os; this then follows its progress until the brand kit is saved.
export function BrandGuideUpload({
  action,
  refresh,
  runningJobId,
  compact = false,
}: {
  action: UploadAction;
  refresh: () => Promise<void>;
  runningJobId?: string;
  compact?: boolean;
}) {
  const initial: UploadState = runningJobId ? { status: "started", jobId: runningJobId } : IDLE;
  const [state, formAction, pending] = useActionState(action, initial);
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const job = useJob(state.status === "started" ? state.jobId : null, refresh);

  const busy = pending || job?.status === "running" || (state.status === "started" && !job);
  const error = state.status === "error" ? state.message : job?.status === "failed" ? job.error : null;

  function submitFiles(files: FileList | null) {
    if (!files?.[0] || !inputRef.current) return;
    if (inputRef.current.files !== files) inputRef.current.files = files;
    formRef.current?.requestSubmit();
  }

  const input = (
    <input
      ref={inputRef}
      name="pdf"
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      disabled={busy}
      onChange={(event) => submitFiles(event.target.files)}
    />
  );

  if (compact) {
    const lastStep = job?.steps.at(-1);
    return (
      <form ref={formRef} action={formAction} className="flex flex-col items-end gap-1">
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium transition hover:border-ink-muted/40 has-disabled:cursor-wait has-disabled:opacity-70">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {busy ? "Claude Code is reading the new guide…" : "Replace guide"}
          {input}
        </label>
        {busy && lastStep ? <p className="text-xs text-ink-muted">{lastStep}</p> : null}
        {error ? <p className="max-w-xs text-right text-xs text-magenta">{error}</p> : null}
      </form>
    );
  }

  return (
    <form ref={formRef} action={formAction}>
      {busy ? (
        <JobProgress job={job} />
      ) : (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event: DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            setDragging(false);
            submitFiles(event.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging ? "border-magenta bg-magenta/5" : "border-line hover:border-ink-muted/40"
          }`}
        >
          <span className="grid size-11 place-items-center rounded-xl bg-ink text-white">
            <FileUp className="size-5" />
          </span>
          <span className="mt-4 text-sm font-medium">Upload the brand guide PDF</span>
          <span className="mt-1 text-sm text-ink-muted">Drop it here or click to choose. Up to 30 MB.</span>
          {input}
        </label>
      )}
      {error ? (
        <p className="mt-3 rounded-lg border border-magenta/30 bg-magenta/5 px-3 py-2 text-sm">{error}</p>
      ) : null}
    </form>
  );
}

function JobProgress({ job }: { job: JobView | null }) {
  const steps = job?.steps ?? ["Handing the guide to Claude Code"];
  const visible = steps.slice(-6);
  return (
    <div className="rounded-2xl border border-magenta/30 bg-magenta/5 p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-magenta" />
        <div>
          <p className="text-sm font-medium">Claude Code is building the brand kit</p>
          <p className="text-xs text-ink-muted">
            It&apos;s using the 5k-brand-kit skill in 5k-os. This usually takes a few minutes.
          </p>
        </div>
      </div>
      <ol className="mt-4 space-y-1.5">
        {visible.map((step, index) => {
          const current = index === visible.length - 1;
          return (
            <li key={`${steps.length - visible.length + index}-${step}`} className="flex items-center gap-2 text-sm">
              {current ? (
                <span className="grid size-4 place-items-center">
                  <span className="size-1.5 animate-pulse rounded-full bg-magenta" />
                </span>
              ) : (
                <Check className="size-4 text-ink-muted" />
              )}
              <span className={current ? "text-ink" : "text-ink-muted"}>{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Polls a Claude Code job; when it succeeds, refreshes the cached kit and the page.
function useJob(jobId: string | null, refresh: () => Promise<void>): JobView | null {
  const router = useRouter();
  const [job, setJob] = useState<JobView | null>(null);
  // The bound action is a new function after every refresh; keep the latest without re-polling.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" }).catch(() => null);
      if (cancelled) return;
      if (!response?.ok) {
        timer = setTimeout(poll, POLL_MS);
        return;
      }
      const next = (await response.json()) as JobView;
      if (cancelled) return;
      setJob(next);
      if (next.status === "running") {
        timer = setTimeout(poll, POLL_MS);
      } else if (next.status === "done") {
        await refreshRef.current();
        router.refresh();
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, router]);

  return jobId && job?.id === jobId ? job : null;
}

export function LogoUpload({ action }: { action: UploadAction }) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <label className="inline-flex h-9 cursor-pointer items-center gap-2 self-start rounded-lg border border-line bg-surface px-3 text-sm font-medium transition hover:border-ink-muted/40 has-disabled:cursor-wait has-disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {pending ? "Adding…" : "Add logo files"}
        <input
          name="logos"
          type="file"
          multiple
          accept=".png,.svg,.jpg,.jpeg,.webp"
          className="sr-only"
          disabled={pending}
          onChange={() => formRef.current?.requestSubmit()}
        />
      </label>
      {state.status === "error" ? <p className="text-xs text-magenta">{state.message}</p> : null}
    </form>
  );
}
