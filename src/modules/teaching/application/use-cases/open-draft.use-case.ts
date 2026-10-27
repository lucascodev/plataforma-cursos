import type { OpenVersion } from '../../domain/entities/versions/open-version.entity';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class OpenDraftUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(slug: string): Promise<OpenVersion> {
    return this.teachingGateway.openDraft(slug);
  }
}
