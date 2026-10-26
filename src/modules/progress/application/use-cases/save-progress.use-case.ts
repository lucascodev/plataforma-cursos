import type { Clock } from '@/shared/application/ports/clock.interface';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import type { SaveProgressInputDto } from '../dtos/save-progress/save-progress-input.dto';

export class SaveProgressUseCase {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: SaveProgressInputDto): Promise<void> {
    await this.progressRepository.save(input.courseSlug, { ...input.progress, updatedAt: this.clock.now().toISOString() });
  }
}
