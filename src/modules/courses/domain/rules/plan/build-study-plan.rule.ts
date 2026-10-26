import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from '@/shared/utils/date/add-days';
import { dayOfWeek } from '@/shared/utils/date/day-of-week';
import type { Course } from '../../entities/course/course.entity';
import type { ModuleDateRange } from '../../entities/plan/module-date-range.entity';
import type { StudyDay } from '../../entities/plan/study-day.entity';
import type { StudyPlan } from '../../entities/plan/study-plan.entity';
import type { StudyTask } from '../../entities/plan/study-task.entity';
import { buildModuleTasks } from './build-module-tasks.rule';
import { buildSundayTask } from './build-sunday-task.rule';
import { createStudyTask } from './create-study-task.rule';
import { hoursForWeekday } from './hours-for-weekday.rule';

interface DaySlot {
  readonly date: DateKey;
  readonly weekday: number;
  readonly task: StudyTask | null;
}

function placeTasks(tasks: readonly StudyTask[], startDate: DateKey, keepSundays: boolean): DaySlot[] {
  const slots: DaySlot[] = [];
  let date = startDate;
  for (const task of tasks) {
    while (dayOfWeek(date) === 0) {
      if (keepSundays) slots.push({ date, weekday: 0, task: null });
      date = addDays(date, 1);
    }
    slots.push({ date, weekday: dayOfWeek(date), task });
    date = addDays(date, 1);
  }
  return slots;
}

function collectModuleRanges(days: readonly StudyDay[]): Map<number, ModuleDateRange> {
  const ranges = new Map<number, ModuleDateRange>();
  for (const day of days) {
    if (day.moduleIndex === null) continue;
    const range = ranges.get(day.moduleIndex);
    ranges.set(day.moduleIndex, { first: range?.first ?? day.date, last: day.date });
  }
  return ranges;
}

export function buildStudyPlan(course: Course, startDate: DateKey): StudyPlan {
  const tasks: StudyTask[] = [
    createStudyTask({ kind: 'kickoff' }),
    ...course.modules.flatMap((module, moduleIndex) => (module.months > 0 ? buildModuleTasks(module, moduleIndex) : [])),
  ];
  const slots = placeTasks(tasks, startDate, course.sundayTrack !== null);
  const totalSundays = slots.filter((slot) => slot.task === null).length;

  let sundayIndex = 0;
  const days: StudyDay[] = slots.map((slot, index) => ({
    ...(slot.task ?? buildSundayTask(course, sundayIndex++, totalSundays)),
    index,
    date: slot.date,
    weekday: slot.weekday,
    hours: hoursForWeekday(slot.weekday, course.rhythm),
  }));

  return {
    startDate,
    days,
    dayByDate: new Map(days.map((day) => [day.date, day])),
    moduleRanges: collectModuleRanges(days),
  };
}
