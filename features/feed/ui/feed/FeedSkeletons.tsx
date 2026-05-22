import { Skeleton } from "../primitives/Skeleton";

function PostCardSkeleton() {
  return (
    <div className="card-surface mb-4 overflow-hidden p-5">
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
      <div className="mt-4 grid grid-cols-4 gap-2">
        <Skeleton className="h-10 rounded-[var(--radius-md)]" />
        <Skeleton className="h-10 rounded-[var(--radius-md)]" />
        <Skeleton className="h-10 rounded-[var(--radius-md)]" />
        <Skeleton className="h-10 rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function FeedSkeletons() {
  return (
    <div className="space-y-4">
      <div className="card-surface p-4">
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 flex-1 rounded-full" />
        </div>
        <div className="mt-3 flex justify-around gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
      <div className="card-surface p-3">
        <div className="flex gap-3 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-[72px] shrink-0 rounded-[var(--radius-xl)]" />
          ))}
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
