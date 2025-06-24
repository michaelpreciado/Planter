export function ListSkeleton() {
  return (
    <div className="space-y-4 px-6 py-4">
      {/* Filter skeleton */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>
      
      {/* Plant list skeleton */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Plant image skeleton */}
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              
              {/* Plant info skeleton */}
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-border/50">
            <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
} 