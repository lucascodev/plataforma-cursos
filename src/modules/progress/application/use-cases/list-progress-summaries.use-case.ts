import type { ProgressSummary } from '../../domain/entities/progress-summary.entity';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';

export class ListProgressSummariesUseCase {
  constructor(private readonly progressRepository: ProgressRepository) {}

  execute(): Promise<ProgressSummary[]> {
    return this.progressRepository.listSummaries();
  }
}
