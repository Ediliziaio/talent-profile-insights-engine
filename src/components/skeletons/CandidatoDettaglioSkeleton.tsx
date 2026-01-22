import { Skeleton } from "@/components/ui/skeleton";

export function CandidatoDettaglioSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Back Button */}
      <Skeleton className="h-10 w-32 mb-6" />

      {/* Header Card */}
      <div className="p-6 rounded-lg border bg-card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border bg-card">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
