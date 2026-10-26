import { ListCoursesUseCase } from '../../application/use-cases/list-courses.use-case';
import { makeCourseRepository } from './make-course-repository.factory';

export function makeListCourses(): ListCoursesUseCase {
  return new ListCoursesUseCase(makeCourseRepository());
}
