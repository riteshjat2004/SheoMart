import type { ReactNode } from "react";

interface DashboardContentProps {
  children: ReactNode;
  className?: string;
}

export function DashboardContent({ children, className }: DashboardContentProps) {
  return <div className={className ?? "space-y-6"}>{children}</div>;
}
