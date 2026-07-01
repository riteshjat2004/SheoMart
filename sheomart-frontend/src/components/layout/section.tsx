import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("py-8 sm:py-10 lg:py-14", className)}>{children}</section>;
}
