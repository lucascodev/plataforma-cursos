import type { DateKey } from '@/shared/domain/types/date-key.type';

export interface Clock {
  today(): DateKey;
  now(): Date;
}
