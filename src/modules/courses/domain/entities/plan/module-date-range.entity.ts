import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface ModuleDateRange {
  readonly first: DateKey;
  readonly last: DateKey;
}
