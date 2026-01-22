import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg p-8 rounded-lg border bg-card">
        <Skeleton className="h-8 w-48 mb-6" />
        
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        <Skeleton className="h-10 w-full mt-8" />
      </div>
    </div>
  );
}
