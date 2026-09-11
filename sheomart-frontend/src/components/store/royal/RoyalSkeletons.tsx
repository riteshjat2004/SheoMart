import { royalTheme } from "./royalTheme";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-[royal-shimmer_1.8s_linear_infinite] rounded-2xl bg-stone-900 ${royalTheme.shimmer} motion-reduce:animate-none ${className}`} />;
}

export function RoyalHeroSkeleton() { return <Skeleton className="h-[440px] w-full" />; }
export function RoyalConciergeSkeleton() { return <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>; }
export function RoyalCollectionSkeletons() { return <div className="flex gap-4 overflow-hidden"><Skeleton className="h-48 min-w-[250px]" /><Skeleton className="h-48 min-w-[250px]" /><Skeleton className="h-48 min-w-[250px]" /></div>; }
export function RoyalLaunchSkeletons() { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>; }