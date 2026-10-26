import { useEffect, useMemo } from 'react';
import type { CourseProgressState, JournalExport } from '@/modules/progress';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { formatDayMonth } from '@/shared/utils/date/format/format-day-month';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { isDateKey } from '@contracts/date/is-date-key';
import { pluralize } from '@/shared/utils/text/pluralize';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { suggestStartDate } from '../../../domain/rules/plan/schedule/suggest-start-date.rule';
import { calculateCourseCompletion } from '../../../domain/rules/summary/completion/calculate-course-completion.rule';
import { calculateMonthsElapsed } from '../../../domain/rules/summary/pace/calculate-months-elapsed.rule';
import { calculatePace } from '../../../domain/rules/summary/pace/calculate-pace.rule';
import { findCurrentModuleIndex } from '../../../domain/rules/summary/completion/find-current-module-index.rule';
import { summarizeStudyDays } from '../../../domain/rules/summary/summarize-study-days.rule';
import { describeCourseFacts } from '../../formatters/describe-course-facts';
import { describePace } from '../../formatters/describe-pace';
import { describeStudyDay } from '../../formatters/describe-study-day';
import { makeBuildStudyPlan } from '../../../main/factories/make-build-study-plan.factory';
import { usePlanCurve } from '../use-plan-curve/use-plan-curve';
import { useWeekNavigation } from '../use-week-navigation/use-week-navigation';
import type { OverviewView } from '../../types/overview-view.type';
import type { PlanStatView } from '../../types/plan/plan-stat-view.type';
import type { WeekView } from '../../types/plan/week-view.type';
import { buildModuleViews } from './builders/build-module-views';
import { buildRhythmView } from './builders/build-rhythm-view';
import { buildTodayView } from './builders/build-today-view';
import { buildWeekDayViews } from './builders/build-week-day-views';

export function useCourseDashboard(details: CourseDetailsOutputDto, progressState: CourseProgressState) {
  const { course, totals } = details;
  const today = makeClock().today();
  const progress = progressState.progress;
  const startDate = progress?.startDate ?? suggestStartDate(today);
  const { setStartDate } = progressState.actions;

  useEffect(() => {
    if (progressState.status === 'ready' && progress && progress.startDate === null) setStartDate(suggestStartDate(today), 'suggested');
  }, [progressState.status, progress, setStartDate, today]);

  // The plan has hundreds of days and is rebuilt only when the course or the start date changes.
  const plan = useMemo(() => makeBuildStudyPlan().execute({ course, startDate }), [course, startDate]);
  const isCompleted = (itemId: string) => (progress ? itemId in progress.completedItems : false);
  const monthsElapsed = calculateMonthsElapsed(startDate, today, totals.months);
  const curve = usePlanCurve(course, isCompleted, monthsElapsed, totals.months);
  const week = useWeekNavigation(plan, today);

  if (!progress) return null;

  const completion = calculateCourseCompletion(course, isCompleted);
  const currentModuleIndex = findCurrentModuleIndex(course, isCompleted);
  const currentModule = course.modules[currentModuleIndex];
  const pace = calculatePace(course, isCompleted, monthsElapsed);
  const days = summarizeStudyDays(plan, (date) => date in progress.studyDays, today);
  const first = plan.days[0];
  const last = plan.days.at(-1);

  return {
    today,
    startDate,
    facts: describeCourseFacts(totals),
    currentModuleId: currentModule?.id ?? null,
    changeStartDate: (value: string) => {
      if (isDateKey(value)) setStartDate(value, 'user');
    },
    overview: {
      percent: completion.percent,
      currentModuleLabel: currentModule ? `M${currentModuleIndex + 1} · ${currentModule.shortTitle}` : '',
      paceText: describePace(pace),
      paceTone: pace.status === 'behind' ? 'behind' : 'ahead',
      curve,
    } satisfies OverviewView,
    planMeta: first && last ? `${plan.days.length} dias · ${formatDayMonth(first.date)} ${first.date.slice(0, 4)} a ${formatDayMonth(last.date)} ${last.date.slice(0, 4)}` : '',
    todayView: buildTodayView(course, plan, progress, today),
    week: { ...week, days: buildWeekDayViews(course, plan, progress, week.dates, today) } satisfies WeekView,
    stats: [
      { text: `${days.completed} de ${days.total} dias feitos`, warning: false },
      { text: `Sequência atual: ${pluralize(days.streak, 'dia', 'dias')}`, warning: false },
      { text: `${pluralize(days.late, 'dia', 'dias')} em atraso`, warning: days.late > 0 },
    ] satisfies PlanStatView[],
    guide: course.guide,
    rhythm: buildRhythmView(course.rhythm),
    modules: buildModuleViews(course, plan, progress, currentModuleIndex),
    buildJournalExport: (): JournalExport => ({
      courseTitle: course.title,
      exportedOn: today,
      completionPercent: completion.percent,
      currentModuleTitle: currentModule?.title ?? '',
      modules: course.modules.map((module, index) => ({ id: module.id, label: `M${index + 1} · ${module.title}` })),
      dayLabels: Object.fromEntries(
        Object.keys(progress.journal).flatMap((date) => {
          const day = plan.dayByDate.get(date);
          return day ? [[date, `${formatFullDate(date).split(',')[0]} · ${describeStudyDay(course, day).title}`]] : [];
        }),
      ),
    }),
  };
}
