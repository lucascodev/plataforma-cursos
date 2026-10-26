import { useMemo, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { useCourseProgress } from '@/modules/progress';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { pluralize } from '@/shared/utils/text/pluralize';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { moduleCode } from '../../../domain/rules/module/module-code.rule';
import { planSpan } from '../../../domain/rules/plan/plan-span.rule';
import { suggestStartDate } from '../../../domain/rules/plan/schedule/suggest-start-date.rule';
import { makeBuildStudyPlan } from '../../../main/factories/make-build-study-plan.factory';
import { describeCourseFacts } from '../../formatters/describe-course-facts';
import type { ModuleAccordionView } from '../../types/module/module-accordion-view.type';
import { buildRhythmView } from '../use-course-dashboard/builders/build-rhythm-view';

export function useCourseDetailsPage({ course, totals }: CourseDetailsOutputDto) {
  const session = useAuthSession();
  const progress = useCourseProgress(course.slug);
  const savedStart = progress.progress?.startDate ?? null;
  const [chosenStart, setChosenStart] = useState<DateKey>(() => suggestStartDate(makeClock().today()));
  const span = useMemo(() => planSpan(makeBuildStudyPlan().execute({ course, startDate: chosenStart })), [course, chosenStart]);

  const modules = course.modules.map(
    (module, index): ModuleAccordionView => ({
      id: module.id,
      code: moduleCode(index),
      title: module.title,
      meta: `${pluralize(module.lessons.length, 'aula', 'aulas')} · ${module.months > 0 ? pluralize(module.months, 'mês', 'meses') : 'aos domingos'}`,
      projectTitle: module.project.title,
      goal: module.goal,
      lessons: module.lessons.map((lesson) => lesson.title),
    }),
  );

  return {
    facts: describeCourseFacts(totals).slice(0, 5),
    modules,
    rhythm: buildRhythmView(course.rhythm),
    plan: {
      startDate: chosenStart,
      setStartDate: setChosenStart,
      studyDaysLabel: pluralize(span.studyDays, 'dia de estudo', 'dias de estudo'),
      rangeLabel: `De ${formatDayMonthYear(span.firstDate)} a ${formatDayMonthYear(span.lastDate)}`,
    },
    action: session.status === 'loading' ? ('loading' as const) : !session.user ? ('sign-in' as const) : savedStart ? ('continue' as const) : ('start' as const),
    startPath: `/cursos/${course.slug}/comecar?inicio=${chosenStart}`,
    todayPath: `/cursos/${course.slug}/hoje`,
    signIn: () => session.signIn(`/cursos/${course.slug}/comecar`),
  };
}
