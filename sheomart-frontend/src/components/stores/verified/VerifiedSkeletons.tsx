import { verifiedTheme } from "@/themes/verifiedTheme";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-[verified-shimmer_1.6s_linear_infinite] rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 motion-reduce:animate-none ${className}`} />;
}

export function VerifiedHeroSkeleton() { return <><Skeleton className="h-[440px] w-full" /><style jsx global>{`@keyframes verified-shimmer { 0% { opacity: .55; } 50% { opacity: 1; } 100% { opacity: .55; } }`}</style></>; }
export function VerifiedTrustSkeletons() { return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>; }
export function VerifiedDiscoverySkeletons() { return <div className={`flex gap-4 overflow-hidden ${verifiedTheme.motion}`}><Skeleton className="h-44 min-w-[245px]" /><Skeleton className="h-44 min-w-[245px]" /><Skeleton className="h-44 min-w-[245px]" /></div>; }