import { TeacherPortal } from "@/components/teacher/TeacherPortal";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function TeacherPage() {
  return (
    <RouteGuard requiredRoles={["TEACHER", "ADMIN"]}>
      <TeacherPortal />
    </RouteGuard>
  );
}
