import type { PublishVersionInputDto } from '../../dtos/publish-version-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class PublishVersionUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: PublishVersionInputDto): Promise<void> {
    return this.adminGateway.publishVersion({ ...input, releaseNote: input.releaseNote.trim() });
  }
}
