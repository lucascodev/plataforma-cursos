import { describe, expect, it } from 'vitest';
import { studyDayStatus } from './study-day-status.rule';

describe('studyDayStatus', () => {
  it('feito vence; depois hoje, atraso e a fazer', () => {
    expect(studyDayStatus('2026-10-20', true, '2026-10-26')).toBe('done');
    expect(studyDayStatus('2026-10-26', false, '2026-10-26')).toBe('today');
    expect(studyDayStatus('2026-10-20', false, '2026-10-26')).toBe('late');
    expect(studyDayStatus('2026-10-30', false, '2026-10-26')).toBe('upcoming');
  });
});
