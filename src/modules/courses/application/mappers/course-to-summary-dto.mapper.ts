import type { Course } from '../../domain/entities/course/course.entity';
import { summarizeCourseTotals } from '../../domain/rules/summary/summarize-course-totals.rule';
import type { CourseSummaryOutputDto } from '../dtos/list-courses/course-summary-output.dto';

export function mapCourseToSummaryDto(course: Course): CourseSummaryOutputDto {
  return {
    slug: course.slug,
    title: course.title,
    tagline: course.tagline,
    level: course.level,
    audience: course.audience,
    totals: summarizeCourseTotals(course),
  };
}
