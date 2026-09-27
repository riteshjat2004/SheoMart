function Shimmer({ className }: { className: string }) {
  return (
    <div
      className={`animate-[normal-shimmer_1.6s_linear_infinite] rounded-2xl bg-stone-200/70 motion-reduce:animate-none dark:bg-stone-800/60 ${className}`}
    />
  );
}

export function NormalHeroSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-64 sm:h-72 lg:h-84 w-full rounded-[2rem]" />
      <style jsx global>{`
        @keyframes normal-shimmer {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

export function NormalInfoGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Shimmer key={index} className="h-28" />
      ))}
    </div>
  );
}

export function NormalCollectionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Shimmer key={index} className="h-32" />
      ))}
    </div>
  );
}

export function NormalProductSkeleton() {
  return <Shimmer className="h-72 w-full" />;
}
