import { StudentDashboard } from "@/components/student/StudentDashboard";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function DashboardPage() {
  return (
    <RouteGuard requiredRoles={["STUDENT", "CLUB_LEAD", "ADMIN"]}>
      <StudentDashboard />
    </RouteGuard>
  );
}
