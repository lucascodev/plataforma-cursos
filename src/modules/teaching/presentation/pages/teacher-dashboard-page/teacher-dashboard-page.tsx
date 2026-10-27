import { RequireRole } from '@/modules/auth';
import { TeacherDashboard } from '../../components/teacher-dashboard/teacher-dashboard';
import { TEACHER_ROLES } from '../../constants/teacher-roles';

export function TeacherDashboardPage() {
  return (
    <RequireRole roles={TEACHER_ROLES} returnPath="/professor">
      <TeacherDashboard />
    </RequireRole>
  );
}
