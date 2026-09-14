import { AdminPortal } from "@/components/admin/AdminPortal";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function AdminPage() {
  return (
    <RouteGuard requiredRoles={["ADMIN"]}>
      <AdminPortal />
    </RouteGuard>
  );
}
