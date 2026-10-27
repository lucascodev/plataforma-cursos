import { useQuery } from '@tanstack/react-query';
import { makeListLabCodes } from '../../../main/factories/make-list-lab-codes.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useLabCodesQuery(slug: string) {
  return useQuery({ queryKey: teachingQueryKeys.labCodes(slug), queryFn: () => makeListLabCodes().execute(slug) });
}
