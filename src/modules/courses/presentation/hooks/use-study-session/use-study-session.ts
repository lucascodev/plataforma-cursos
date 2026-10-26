import { useAuthSession } from '@/modules/auth';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { CourseNotFoundError } from '../../../domain/errors/course-not-found.error';
import { useCourseDetailsQuery } from '../use-course-details-query/use-course-details-query';

type StudySession =
  | { readonly status: 'signed-out' | 'loading' | 'not-found' | 'unavailable' }
  | { readonly status: 'ready'; readonly details: CourseDetailsOutputDto };

export function useStudySession(slug: string): StudySession {
  const session = useAuthSession();
  const details = useCourseDetailsQuery(slug);

  if (session.status === 'signed-out') return { status: 'signed-out' };
  if (details.isError) return { status: details.error instanceof CourseNotFoundError ? 'not-found' : 'unavailable' };
  if (session.status === 'loading' || !details.data) return { status: 'loading' };
  return { status: 'ready', details: details.data };
}
