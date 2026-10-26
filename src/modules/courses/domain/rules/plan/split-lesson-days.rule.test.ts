import { describe, expect, it } from 'vitest';
import { splitLessonDays } from './split-lesson-days.rule';

describe('splitLessonDays', () => {
  it('always studies first and reviews only lessons with three days or more', () => {
    expect(splitLessonDays(1)).toEqual({ study: 1, exercise: 0, review: 0 });
    expect(splitLessonDays(2)).toEqual({ study: 1, exercise: 1, review: 0 });
    expect(splitLessonDays(4)).toEqual({ study: 1, exercise: 2, review: 1 });
    expect(splitLessonDays(10)).toEqual({ study: 4, exercise: 5, review: 1 });
  });
});
