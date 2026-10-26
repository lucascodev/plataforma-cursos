import type { Course } from '../../../entities/course/course.entity';
import type { PaceSummary } from '../../../entities/summary/pace-summary.entity';
import type { IsCompleted } from '../../item-ids/is-completed.type';
import { listModuleItemIds } from '../../item-ids/list-module-item-ids.rule';
import { calculateActualRemainingShare } from './calculate-actual-remaining-share.rule';
import { calculatePlannedRemainingShare } from './calculate-planned-remaining-share.rule';

export function calculatePace(course: Course, isCompleted: IsCompleted, monthsElapsed: number): PaceSummary {
  const total = course.modules.filter((module) => module.months > 0).flatMap(listModuleItemIds).length;
  const difference = calculatePlannedRemainingShare(course, monthsElapsed) - calculateActualRemainingShare(course, isCompleted);
  const items = Math.round(difference * total);
  if (items > 0) return { status: 'ahead', items };
  if (items < 0) return { status: 'behind', items: -items };
  return { status: 'on-track', items: 0 };
}
