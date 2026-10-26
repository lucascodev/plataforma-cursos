import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import { createEmptyProgress } from '../../domain/rules/create-empty-progress.rule';
import type { LoadProgressInputDto } from '../dtos/load-progress/load-progress-input.dto';
import type { LoadProgressOutputDto } from '../dtos/load-progress/load-progress-output.dto';

export class LoadProgressUseCase {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async execute(input: LoadProgressInputDto): Promise<LoadProgressOutputDto> {
    const progress = await this.progressRepository.load(input.courseSlug);
    return { progress: progress ?? createEmptyProgress() };
  }
}
