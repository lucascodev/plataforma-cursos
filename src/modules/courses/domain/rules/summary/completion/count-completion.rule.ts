import type { CompletionSummary } from '../../../entities/summary/completion-summary.entity';
import type { IsCompleted } from '../../item-ids/is-completed.type';

export function countCompletion(itemIds: readonly string[], isCompleted: IsCompleted): CompletionSummary {
  const completed = itemIds.filter(isCompleted).length;
  const total = itemIds.length;
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}
