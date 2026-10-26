import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import type { LoadProgressInputDto } from '../dtos/load-progress/load-progress-input.dto';

export class EraseProgressUseCase {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async execute(input: LoadProgressInputDto): Promise<void> {
    await this.progressRepository.clear(input.courseSlug);
  }
}
