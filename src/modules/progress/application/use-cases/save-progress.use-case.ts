import type { Clock } from '@/shared/application/ports/clock.interface';
import { ProgressConflictError } from '../../domain/errors/progress-conflict.error';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import { createEmptyProgress } from '../../domain/rules/create-empty-progress.rule';
import { mergeProgress } from '../../domain/rules/merge/merge-progress.rule';
import type { SaveProgressInputDto } from '../dtos/save-progress/save-progress-input.dto';
import type { SaveProgressOutputDto } from '../dtos/save-progress/save-progress-output.dto';

export class SaveProgressUseCase {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: SaveProgressInputDto): Promise<SaveProgressOutputDto> {
    const progress = { ...input.progress, updatedAt: this.clock.now().toISOString() };
    try {
      return { progress, revision: await this.progressRepository.save(input.courseSlug, progress, input.base.revision) };
    } catch (error) {
      if (!(error instanceof ProgressConflictError)) throw error;
      const remote = (await this.progressRepository.load(input.courseSlug)) ?? { progress: createEmptyProgress(), revision: 0 };
      const merged = mergeProgress(input.base.progress, progress, remote.progress);
      return { progress: merged, revision: await this.progressRepository.save(input.courseSlug, merged, remote.revision) };
    }
  }
}
