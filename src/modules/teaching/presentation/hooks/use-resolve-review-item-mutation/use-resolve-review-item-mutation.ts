import { useMutation } from '@tanstack/react-query';
import type { ResolveReviewItemInputDto } from '../../../application/dtos/resolve-review-item-input.dto';
import { makeResolveReviewItem } from '../../../main/factories/make-resolve-review-item.factory';

export function useResolveReviewItemMutation() {
  return useMutation({ mutationFn: (input: ResolveReviewItemInputDto) => makeResolveReviewItem().execute(input) });
}
