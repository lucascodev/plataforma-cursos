import type { Course } from '../../domain/entities/course/course.entity';
import { moduleCode } from '../../domain/rules/module/module-code.rule';
import { summarizeCourseTotals } from '../../domain/rules/summary/summarize-course-totals.rule';
import type { CourseSummaryOutputDto } from '../dtos/list-courses/course-summary-output.dto';

export function mapCourseToSummaryDto(course: Course): CourseSummaryOutputDto {
  return {
    slug: course.slug,
    title: course.title,
    tagline: course.tagline,
    description: course.description,
    level: course.level,
    audience: course.audience,
    version: course.version,
    updatedAt: course.updatedAt,
    rhythm: course.rhythm,
    kickoff: course.kickoff,
    author: course.author,
    modules: course.modules.map((module, index) => ({
      id: module.id,
      code: moduleCode(index),
      shortTitle: module.shortTitle,
      title: module.title,
      kind: module.kind,
      months: module.months,
      lessonCount: module.lessons.length,
      projectTitle: module.project.title,
    })),
    totals: summarizeCourseTotals(course),
  };
}
