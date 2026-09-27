import { royalTheme } from "./royalTheme";

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-[royal-shimmer_1.8s_linear_infinite] rounded-2xl border border-amber-400/20 bg-stone-950/80 ${royalTheme.shimmer} motion-reduce:animate-none ${className}`}
    />
  );
}

export function RoyalHeroSkeleton() {
  return <Skeleton className="h-[460px] w-full rounded-[2rem]" />;
}

export function RoyalConciergeSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-48 rounded-[2rem]" />
      <Skeleton className="h-48 rounded-[2rem]" />
    </div>
  );
}

export function RoyalCollectionSkeletons() {
  return (
    <div className="flex gap-4 overflow-hidden">
      <Skeleton className="h-52 min-w-[260px] rounded-3xl" />
      <Skeleton className="h-52 min-w-[260px] rounded-3xl" />
      <Skeleton className="h-52 min-w-[260px] rounded-3xl" />
    </div>
  );
}

export function RoyalLaunchSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-72 rounded-[1.6rem]" />
      <Skeleton className="h-72 rounded-[1.6rem]" />
      <Skeleton className="h-72 rounded-[1.6rem]" />
      <Skeleton className="h-72 rounded-[1.6rem]" />
    </div>
  );
}