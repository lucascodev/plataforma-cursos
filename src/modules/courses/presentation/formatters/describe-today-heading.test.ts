import { describe, expect, it } from 'vitest';
import { describeTodayHeading } from './describe-today-heading';

describe('describeTodayHeading', () => {
  it('diz que tipo de dia é hoje', () => {
    expect(describeTodayHeading('lesson-exercise')).toBe('Hoje é dia de exercício');
    expect(describeTodayHeading('project-build')).toBe('Hoje é dia de projeto');
    expect(describeTodayHeading('sunday-rotation')).toBe('Domingo leve');
  });
});
