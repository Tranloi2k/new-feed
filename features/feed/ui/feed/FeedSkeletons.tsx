import { Skeleton } from "../primitives/Skeleton";

function PostCardSkeleton() {
  return (
    <div className="border-b border-[color:var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
      <Skeleton className="mt-4 aspect-[16/10] w-full rounded-[var(--radius-lg)]" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-8 w-12 rounded-full" />
        <Skeleton className="h-8 w-12 rounded-full" />
        <Skeleton className="h-8 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function FeedSkeletons() {
  return (
    <div>
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
