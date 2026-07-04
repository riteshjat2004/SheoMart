import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const role = useAuthStore.getState().user?.role ?? "store_owner";

  return (
    <RouteGuard allowedRoles={["platform_admin", "store_owner"]}>
      <DashboardLayout role={role}>{children}</DashboardLayout>
    </RouteGuard>
  );
}
