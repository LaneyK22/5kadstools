import { PageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto">
      <PageSkeleton />
    </main>
  );
}
