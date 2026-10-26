import type { Course } from '../../../entities/course/course.entity';
import { listModuleItemIds } from '../../item-ids/list-module-item-ids.rule';

export function calculatePlannedRemainingShare(course: Course, monthsElapsed: number): number {
  const timedModules = course.modules.filter((module) => module.months > 0);
  const total = timedModules.reduce((sum, module) => sum + listModuleItemIds(module).length, 0);
  if (!total) return 0;

  let monthCursor = 0;
  let plannedItems = 0;
  for (const module of timedModules) {
    const items = listModuleItemIds(module).length;
    if (monthsElapsed >= monthCursor + module.months) {
      plannedItems += items;
      monthCursor += module.months;
      continue;
    }
    if (monthsElapsed > monthCursor) plannedItems += (items * (monthsElapsed - monthCursor)) / module.months;
    break;
  }
  return 1 - plannedItems / total;
}
