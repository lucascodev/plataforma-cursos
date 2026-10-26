import { GetCourseBySlugUseCase } from '../../application/use-cases/get-course-by-slug.use-case';
import { makeCourseRepository } from './make-course-repository.factory';

export function makeGetCourseBySlug(): GetCourseBySlugUseCase {
  return new GetCourseBySlugUseCase(makeCourseRepository());
}
