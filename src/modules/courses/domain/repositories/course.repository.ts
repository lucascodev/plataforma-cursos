import type { Course } from '../entities/course/course.entity';

export interface CourseRepository {
  listAll(): Promise<Course[]>;
  findBySlug(slug: string): Promise<Course | null>;
}
