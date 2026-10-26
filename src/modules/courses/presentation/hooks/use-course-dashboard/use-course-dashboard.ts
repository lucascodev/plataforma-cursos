import { useMemo } from 'react';
import type { CourseProgressState, JournalExport } from '@/modules/progress';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { moduleCode } from '../../../domain/rules/module/module-code.rule';
import { planWeek } from '../../../domain/rules/plan/plan-week.rule';
import { suggestStartDate } from '../../../domain/rules/plan/schedule/suggest-start-date.rule';
import { calculateCourseCompletion } from '../../../domain/rules/summary/completion/calculate-course-completion.rule';
import { findCurrentModuleIndex } from '../../../domain/rules/summary/completion/find-current-module-index.rule';
import { findOldestOverdueDay } from '../../../domain/rules/summary/find-oldest-overdue-day.rule';
import { calculateMonthsElapsed } from '../../../domain/rules/summary/pace/calculate-months-elapsed.rule';
import { calculatePace } from '../../../domain/rules/summary/pace/calculate-pace.rule';
import { summarizeStudyDays } from '../../../domain/rules/summary/summarize-study-days.rule';
import { makeBuildStudyPlan } from '../../../main/factories/make-build-study-plan.factory';
import { describePace } from '../../formatters/describe-pace';
import { describeStudyDay } from '../../formatters/describe-study-day';
import type { OverviewView } from '../../types/overview-view.type';
import type { WeekView } from '../../types/plan/week-view.type';
import { useWeekNavigation } from '../use-week-navigation/use-week-navigation';
import { buildModuleViews } from './builders/build-module-views';
import { buildTodayView } from './builders/build-today-view';
import { buildWeekDayViews } from './builders/build-week-day-views';

export function useCourseDashboard(details: CourseDetailsOutputDto, progressState: CourseProgressState) {
  const { course, totals } = details;
  const today = makeClock().today();
  const progress = progressState.progress;
  const startDate = progress?.startDate ?? suggestStartDate(today);

  // The plan has hundreds of days and is rebuilt only when the course or the start date changes.
  const plan = useMemo(() => makeBuildStudyPlan().execute({ course, startDate }), [course, startDate]);
  const isCompleted = (itemId: string) => (progress ? itemId in progress.completedItems : false);
  const monthsElapsed = calculateMonthsElapsed(startDate, today, totals.months);
  const week = useWeekNavigation(plan, today);

  if (!progress) return null;

  const completion = calculateCourseCompletion(course, isCompleted);
  const currentModuleIndex = findCurrentModuleIndex(course, isCompleted);
  const currentModule = course.modules[currentModuleIndex];
  const pace = calculatePace(course, isCompleted, monthsElapsed);
  const isDayDone = (date: string) => date in progress.studyDays;

  return {
    course,
    plan,
    today,
    startDate,
    completion,
    days: summarizeStudyDays(plan, isDayDone, today),
    oldestOverdueDate: findOldestOverdueDay(plan, isDayDone, today),
    week: planWeek(plan, today),
    currentModuleId: currentModule?.id ?? null,
    overview: {
      percent: completion.percent,
      currentModuleLabel: currentModule ? `${moduleCode(currentModuleIndex)} · ${currentModule.shortTitle}` : '',
      paceText: describePace(pace),
      paceTone: pace.status === 'behind' ? 'behind' : 'ahead',
    } satisfies OverviewView,
    todayView: buildTodayView(course, plan, progress, today),
    weekView: { ...week, days: buildWeekDayViews(course, plan, progress, week.dates, today) } satisfies WeekView,
    modules: buildModuleViews(course, plan, progress, currentModuleIndex),
    buildJournalExport: (): JournalExport => ({
      courseTitle: course.title,
      exportedOn: today,
      completionPercent: completion.percent,
      currentModuleTitle: currentModule?.title ?? '',
      modules: course.modules.map((module, index) => ({ id: module.id, label: `${moduleCode(index)} · ${module.title}` })),
      dayLabels: Object.fromEntries(
        Object.keys(progress.journal).flatMap((date) => {
          const day = plan.dayByDate.get(date);
          return day ? [[date, `${formatFullDate(date).split(',')[0]} · ${describeStudyDay(course, day).title}`]] : [];
        }),
      ),
    }),
  };
}
