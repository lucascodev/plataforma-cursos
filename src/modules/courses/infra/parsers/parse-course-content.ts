import type { Course } from '../../domain/entities/course/course.entity';
import { InvalidCourseContentError } from '../errors/invalid-course-content.error';
import { mapCourseContentToEntity } from '../mappers/course-content-to-entity.mapper';
import { courseContentSchema } from '@contracts/course-content.schema';

export function parseCourseContent(source: string, raw: unknown): Course {
  const result = courseContentSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`);
    throw new InvalidCourseContentError(source, problems);
  }
  return mapCourseContentToEntity(result.data);
}
