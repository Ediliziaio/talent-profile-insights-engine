import { Skeleton } from "@/components/ui/skeleton";

export function QuestionarioSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl p-8 rounded-lg border bg-card">
        <Skeleton className="h-6 w-full mb-8" />
        
        {/* Options */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
