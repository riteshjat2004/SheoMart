import { DashboardRouteLayout } from "@/components/dashboard/layout/DashboardRouteLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardRouteLayout role="platform_admin">{children}</DashboardRouteLayout>;
}
