import { describeCourseFacts, type CourseSummaryOutputDto } from '@/modules/courses';
import { pluralize } from '@/shared/utils/text/pluralize';
import type { FeaturedCourseView } from '../../../types/featured-course-view.type';

const FEATURED_FACT_COUNT = 5;

export function buildFeaturedCourseView(course: CourseSummaryOutputDto): FeaturedCourseView {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    tagline: course.tagline,
    facts: describeCourseFacts(course.totals).slice(0, FEATURED_FACT_COUNT),
    trail: course.modules.map((module) => ({
      id: module.id,
      code: module.code,
      title: module.shortTitle,
      meta: module.months > 0 ? pluralize(module.months, 'mês', 'meses') : 'aos domingos',
      isCapstone: module.kind === 'capstone',
    })),
  };
}
