import type { ReviewItem } from '../../domain/entities/versions/review-item.entity';
import type { ResolveReviewItemInputDto } from '../dtos/resolve-review-item-input.dto';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class ResolveReviewItemUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(input: ResolveReviewItemInputDto): Promise<ReviewItem[]> {
    return this.teachingGateway.resolveReviewItem(input);
  }
}
