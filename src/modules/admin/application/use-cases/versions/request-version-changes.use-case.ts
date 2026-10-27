import { parseReviewItems } from '../../../domain/rules/versions/parse-review-items.rule';
import type { RequestVersionChangesInputDto } from '../../dtos/request-version-changes-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class RequestVersionChangesUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute({ id, revision, text }: RequestVersionChangesInputDto): Promise<void> {
    return this.adminGateway.requestVersionChanges(id, revision, parseReviewItems(text));
  }
}
