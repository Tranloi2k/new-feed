function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
      }}
    ></div>
  );
}

export default function HomeSkeletons() {
  return (
    <div className="space-y-6">
      {/* Skeleton for CreatePost */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2 items-center mb-3">
          <Skeleton className="w-10 h-10" />
          <Skeleton className="flex-1 h-10" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>

      {/* Skeletons for posts */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4"
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-10 h-10" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
          </div>
          <Skeleton className="w-full h-64" />
          <div className="px-4 py-2">
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2 p-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const PostSkeletion = () => {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4"
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-10 h-10" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
          </div>
          <Skeleton className="w-full h-64" />
          <div className="px-4 py-2">
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2 p-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
};
