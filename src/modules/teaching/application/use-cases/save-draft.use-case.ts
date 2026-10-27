import type { SaveDraftInputDto } from '../dtos/save-draft-input.dto';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class SaveDraftUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(input: SaveDraftInputDto): Promise<number> {
    return this.teachingGateway.saveDraft(input);
  }
}
