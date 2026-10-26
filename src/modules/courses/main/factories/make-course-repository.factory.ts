import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { HttpCourseRepository } from '../../infra/repositories/http-course.repository';

export function makeCourseRepository(): CourseRepository {
  return new HttpCourseRepository(makeHttpClient());
}
