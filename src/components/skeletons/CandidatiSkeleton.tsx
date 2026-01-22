import { Skeleton } from "@/components/ui/skeleton";

export function CandidatiSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table Header */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center gap-4 p-4 border-b">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
