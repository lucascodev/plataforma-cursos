import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { Course } from '../../domain/entities/course/course.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { COURSE_API_PATHS } from '../constants/course-api-paths';
import { parseCourseContent } from '../parsers/parse-course-content';
import { courseListResponseSchema } from '../schemas/course-list-response.schema';
import { courseResponseSchema } from '../schemas/course-response.schema';

export class HttpCourseRepository implements CourseRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listAll(): Promise<Course[]> {
    const { courses } = courseListResponseSchema.parse(await this.httpClient.request({ path: COURSE_API_PATHS.list }));
    return courses.flatMap((raw, index) => {
      try {
        return [parseCourseContent(`${COURSE_API_PATHS.list}[${index}]`, raw)];
      } catch (error) {
        // A broken course must not take the whole catalog down; the database only receives content checked by the same schema.
        console.error(error);
        return [];
      }
    });
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const path = COURSE_API_PATHS.detail(slug);
    let body: unknown;
    try {
      body = await this.httpClient.request({ path });
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) return null;
      throw error;
    }
    const response = courseResponseSchema.parse(body);
    return { ...parseCourseContent(path, response.course), author: response.author };
  }
}
