export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-10 py-10" aria-busy>
      <div className="border-b border-line pb-6">
        <div className="h-3 w-28 animate-pulse rounded bg-line" />
        <div className="mt-3 h-8 w-72 animate-pulse rounded-lg bg-line" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-line" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="h-80 animate-pulse rounded-2xl bg-line/60 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-line/60 lg:col-span-3" />
      </div>
    </div>
  );
}
