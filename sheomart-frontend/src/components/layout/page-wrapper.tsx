import { cn } from "@/lib/utils";

export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_50%)]", className)}>{children}</div>;
}
