import type { CourseRepository } from '../../domain/repositories/course.repository';
import type { CourseSummaryOutputDto } from '../dtos/list-courses/course-summary-output.dto';
import { mapCourseToSummaryDto } from '../mappers/course-to-summary-dto.mapper';

export class ListCoursesUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(): Promise<CourseSummaryOutputDto[]> {
    const courses = await this.courseRepository.listAll();
    return courses.map(mapCourseToSummaryDto);
  }
}
