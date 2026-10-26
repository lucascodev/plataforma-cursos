import type { CourseModule } from '../../../entities/course/module/course-module.entity';
import type { CompletionSummary } from '../../../entities/summary/completion-summary.entity';
import type { IsCompleted } from '../../item-ids/is-completed.type';
import { listModuleItemIds } from '../../item-ids/list-module-item-ids.rule';
import { countCompletion } from './count-completion.rule';

export function calculateModuleCompletion(module: CourseModule, isCompleted: IsCompleted): CompletionSummary {
  return countCompletion(listModuleItemIds(module), isCompleted);
}
