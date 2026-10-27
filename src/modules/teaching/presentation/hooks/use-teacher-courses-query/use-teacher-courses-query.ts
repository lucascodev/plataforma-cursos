import { useQuery } from '@tanstack/react-query';
import { makeListTeacherCourses } from '../../../main/factories/make-list-teacher-courses.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useTeacherCoursesQuery() {
  return useQuery({ queryKey: teachingQueryKeys.courses(), queryFn: () => makeListTeacherCourses().execute(), staleTime: 15_000 });
}
