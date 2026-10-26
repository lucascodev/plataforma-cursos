import { describe, expect, it } from 'vitest';
import { dayOfWeek } from '@/shared/utils/date/calendar/day-of-week';
import { listModuleItemIds } from '../item-ids/list-module-item-ids.rule';
import { buildStudyPlan } from './build-study-plan.rule';
import { suggestStartDate } from './suggest-start-date.rule';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';

const course = loadTestCourse();
const plan = buildStudyPlan(course, '2026-10-26');

describe('buildStudyPlan', () => {
  it('starts on the start date with the kickoff task', () => {
    expect(plan.days[0]?.date).toBe('2026-10-26');
    expect(plan.days[0]?.kind).toBe('kickoff');
  });

  it('keeps consecutive dates without gaps', () => {
    plan.days.forEach((day, index) => expect(day.index).toBe(index));
    expect(new Set(plan.days.map((day) => day.date)).size).toBe(plan.days.length);
  });

  it('uses Sundays only for the Sunday track', () => {
    for (const day of plan.days) {
      const isSundayTask = day.kind === 'sunday-rotation' || day.kind === 'sunday-milestone';
      expect(dayOfWeek(day.date) === 0).toBe(isSundayTask);
    }
  });

  it('schedules every lesson, drill and project of timed modules', () => {
    const scheduled = new Set(plan.days.map((day) => day.itemId).filter(Boolean));
    const expected = course.modules.filter((module) => module.months > 0).flatMap(listModuleItemIds);
    expect(expected.filter((itemId) => !scheduled.has(itemId))).toEqual([]);
  });

  it('applies the study rhythm to each weekday', () => {
    const saturday = plan.days.find((day) => day.weekday === 6);
    const monday = plan.days.find((day) => day.weekday === 1);
    expect(saturday?.hours).toBe(course.rhythm.saturdayHours);
    expect(monday?.hours).toBe(course.rhythm.weekdayHours);
  });

  it('places milestones counted from the end of the course', () => {
    const sundays = plan.days.filter((day) => day.weekday === 0);
    const lastSunday = sundays.at(-1);
    expect(lastSunday?.kind).toBe('sunday-milestone');
    expect(lastSunday?.trackEntryIndex).toBe(course.sundayTrack?.milestones.findIndex((milestone) => milestone.sunday === -1));
  });

  it('keeps modules in order without overlap', () => {
    const ranges = course.modules
      .map((module, index) => ({ module, range: plan.moduleRanges.get(index) }))
      .filter(({ module }) => module.months > 0);
    for (let index = 1; index < ranges.length; index += 1) {
      expect((ranges[index]?.range?.first ?? '') > (ranges[index - 1]?.range?.last ?? '')).toBe(true);
    }
  });

  it('matches the length of the current course content', () => {
    expect(plan.days.length).toBe(463);
    expect(plan.days.at(-1)?.date).toBe('2028-01-31');
  });
});

describe('suggestStartDate', () => {
  it('suggests the next Monday, or today when today is Monday', () => {
    expect(suggestStartDate('2026-10-26')).toBe('2026-10-26');
    expect(suggestStartDate('2026-10-25')).toBe('2026-10-26');
    expect(suggestStartDate('2026-10-27')).toBe('2026-11-02');
  });
});
