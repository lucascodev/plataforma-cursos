import type { Course } from '../../../entities/course/course.entity';
import type { CompletionSummary } from '../../../entities/summary/completion-summary.entity';
import type { IsCompleted } from '../../item-ids/is-completed.type';
import { listModuleItemIds } from '../../item-ids/list-module-item-ids.rule';
import { countCompletion } from './count-completion.rule';

export function calculateCourseCompletion(course: Course, isCompleted: IsCompleted): CompletionSummary {
  return countCompletion(course.modules.flatMap(listModuleItemIds), isCompleted);
}
