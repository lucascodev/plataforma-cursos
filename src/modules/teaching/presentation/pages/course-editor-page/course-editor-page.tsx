import { useLocation, useParams } from 'react-router';
import { RequireRole } from '@/modules/auth';
import { CourseEditorLoader } from '../../components/course-editor-loader/course-editor-loader';
import { TEACHER_ROLES } from '../../constants/teacher-roles';

export function CourseEditorPage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  return (
    <RequireRole roles={TEACHER_ROLES} returnPath={location.pathname}>
      <CourseEditorLoader slug={slug} />
    </RequireRole>
  );
}
