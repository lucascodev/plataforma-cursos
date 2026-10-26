import type { Clock } from '@/shared/application/ports/clock.interface';
import { SystemClock } from '@/shared/infra/clock/system-clock';

const clock = new SystemClock();

export function makeClock(): Clock {
  return clock;
}
