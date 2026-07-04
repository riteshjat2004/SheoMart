import { DashboardRouteLayout } from "@/components/dashboard/layout/DashboardRouteLayout";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <DashboardRouteLayout role="store_owner">{children}</DashboardRouteLayout>;
}
