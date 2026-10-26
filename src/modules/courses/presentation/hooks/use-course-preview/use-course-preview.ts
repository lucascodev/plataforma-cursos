import { pluralize } from '@/shared/utils/text/pluralize';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { describeCourseFacts } from '../../formatters/describe-course-facts';
import type { ModuleOutlineView } from '../../types/module/module-outline-view.type';
import { buildRhythmView } from '../use-course-dashboard/builders/build-rhythm-view';

export function useCoursePreview({ course, totals }: CourseDetailsOutputDto) {
  return {
    facts: describeCourseFacts(totals),
    rhythm: buildRhythmView(course.rhythm),
    modules: course.modules.map(
      (module, index): ModuleOutlineView => ({
        id: module.id,
        label: `M${index + 1}`,
        title: module.title,
        meta: `${pluralize(module.lessons.length, 'aula', 'aulas')} · ${pluralize(module.drills.length, 'exercício', 'exercícios')} · projeto`,
      }),
    ),
  };
}
