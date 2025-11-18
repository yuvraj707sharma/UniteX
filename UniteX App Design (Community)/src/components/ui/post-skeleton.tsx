import { Skeleton } from "./skeleton";
import { cn } from "./utils";

interface PostSkeletonProps {
  className?: string;
}

export function PostSkeleton({ className }: PostSkeletonProps) {
  return (
    <div className={cn("border-b dark:border-zinc-800 light:border-gray-200 p-4", className)}>
      {/* Header with avatar and user info */}
      <div className="flex items-start space-x-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Image placeholder (sometimes shown) */}
      {Math.random() > 0.5 && (
        <Skeleton className="h-48 w-full rounded-lg mb-3" />
      )}
      
      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center space-x-6">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-5 w-8" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  );
}

export default PostSkeleton;
