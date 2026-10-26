import type { Course } from '../../../entities/course/course.entity';
import type { IsCompleted } from '../../item-ids/is-completed.type';
import { calculateModuleCompletion } from './calculate-module-completion.rule';

export function findCurrentModuleIndex(course: Course, isCompleted: IsCompleted): number {
  const index = course.modules.findIndex((module) => {
    const { completed, total } = calculateModuleCompletion(module, isCompleted);
    return completed < total;
  });
  return index === -1 ? course.modules.length - 1 : index;
}
