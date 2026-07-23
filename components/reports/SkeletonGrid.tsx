export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="h-48 bg-neutral-200 dark:bg-neutral-800" />
          
          <div className="p-5 flex flex-col gap-4">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start">
              <div className="w-24 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div className="w-16 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
            </div>
            
            {/* Title / Location Skeleton */}
            <div className="w-3/4 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
            
            {/* Chips Skeleton */}
            <div className="flex gap-2">
              <div className="w-20 h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
              <div className="w-24 h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </div>
            
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 w-full" />
            
            {/* Footer Skeleton */}
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
