import type { Course } from '../../../domain/entities/course/course.entity';
import type { IsCompleted } from '../../../domain/rules/item-ids/is-completed.type';
import { calculateActualRemainingShare } from '../../../domain/rules/summary/pace/calculate-actual-remaining-share.rule';
import { calculatePlannedRemainingShare } from '../../../domain/rules/summary/pace/calculate-planned-remaining-share.rule';
import type { PlanCurveView } from '../../types/plan/plan-curve-view.type';

const WIDTH = 340;
const HEIGHT = 150;
const PADDING = { left: 36, right: 10, top: 10, bottom: 28 };
const SAMPLES = 76;

export function usePlanCurve(course: Course, isCompleted: IsCompleted, monthsElapsed: number, totalMonths: number): PlanCurveView {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const months = Math.max(totalMonths, 1);
  const x = (month: number) => PADDING.left + (month / months) * plotWidth;
  const y = (share: number) => PADDING.top + (1 - share) * plotHeight;

  const plannedPath = Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const month = (index / SAMPLES) * months;
    return `${index ? 'L' : 'M'}${x(month).toFixed(1)} ${y(calculatePlannedRemainingShare(course, month)).toFixed(1)}`;
  }).join('');

  return {
    width: WIDTH,
    height: HEIGHT,
    plotLeft: PADDING.left,
    plotRight: WIDTH - PADDING.right,
    plotBottom: PADDING.top + plotHeight,
    plannedPath,
    point: {
      x: x(monthsElapsed),
      y: y(calculateActualRemainingShare(course, isCompleted)),
      plannedY: y(calculatePlannedRemainingShare(course, monthsElapsed)),
    },
    xTicks: Array.from({ length: Math.floor(months / 3) + 1 }, (_, index) => ({ x: x(index * 3), label: String(index * 3) })),
    yTicks: [0, 0.5, 1].map((share) => ({ y: y(share), label: `${share * 100}%` })),
  };
}
