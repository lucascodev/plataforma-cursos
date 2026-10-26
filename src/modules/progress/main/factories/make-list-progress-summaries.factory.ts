import { ListProgressSummariesUseCase } from '../../application/use-cases/list-progress-summaries.use-case';
import { makeProgressRepository } from './make-progress-repository.factory';

export function makeListProgressSummaries(): ListProgressSummariesUseCase {
  return new ListProgressSummariesUseCase(makeProgressRepository());
}
