import { planTuning } from '../../constants/plan-tuning';
import type { CourseModule } from '../../entities/course/course-module.entity';

export function weeksForModule(module: Pick<CourseModule, 'months'>): number {
  return Math.round(module.months * planTuning.weeksPerMonth);
}
