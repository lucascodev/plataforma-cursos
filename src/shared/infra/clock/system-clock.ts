import type { Clock } from '@/shared/application/ports/clock.interface';
import type { DateKey } from '@/shared/domain/types/date-key.type';

export class SystemClock implements Clock {
  today(): DateKey {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  now(): Date {
    return new Date();
  }
}
