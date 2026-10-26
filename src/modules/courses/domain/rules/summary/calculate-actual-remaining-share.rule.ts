import type { Course } from '../../entities/course/course.entity';
import type { IsCompleted } from '../item-ids/is-completed.type';
import { listModuleItemIds } from '../item-ids/list-module-item-ids.rule';

export function calculateActualRemainingShare(course: Course, isCompleted: IsCompleted): number {
  const itemIds = course.modules.filter((module) => module.months > 0).flatMap(listModuleItemIds);
  if (!itemIds.length) return 0;
  return 1 - itemIds.filter(isCompleted).length / itemIds.length;
}
