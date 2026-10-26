import { CourseNotFoundError } from '../../domain/errors/course-not-found.error';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { summarizeCourseTotals } from '../../domain/rules/summary/summarize-course-totals.rule';
import type { CourseDetailsOutputDto } from '../dtos/get-course-by-slug/course-details-output.dto';
import type { GetCourseBySlugInputDto } from '../dtos/get-course-by-slug/get-course-by-slug-input.dto';

export class GetCourseBySlugUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(input: GetCourseBySlugInputDto): Promise<CourseDetailsOutputDto> {
    const course = await this.courseRepository.findBySlug(input.slug);
    if (!course) throw new CourseNotFoundError(input.slug);
    return { course, totals: summarizeCourseTotals(course) };
  }
}
