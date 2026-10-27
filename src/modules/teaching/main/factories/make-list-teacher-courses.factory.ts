import { ListTeacherCoursesUseCase } from '../../application/use-cases/list-teacher-courses.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeListTeacherCourses(): ListTeacherCoursesUseCase {
  return new ListTeacherCoursesUseCase(makeTeachingGateway());
}
