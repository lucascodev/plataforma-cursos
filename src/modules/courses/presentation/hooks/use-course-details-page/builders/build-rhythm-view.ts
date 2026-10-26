import { WEEKDAY_SHORT_NAMES } from '@/shared/utils/date/names/weekday-short-names';
import { pluralize } from '@/shared/utils/text/pluralize';
import type { StudyRhythm } from '../../../../domain/entities/course/study-rhythm.entity';
import { hoursForWeekday } from '../../../../domain/rules/plan/schedule/hours-for-weekday.rule';
import type { RhythmView } from '../../../types/plan/rhythm-view.type';

const WIDTH = 280;
const HEIGHT = 110;
const LABEL_SPACE = 18;
const GAP = 8;
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export function buildRhythmView(rhythm: StudyRhythm): RhythmView {
  const hours = WEEK_ORDER.map((weekday) => hoursForWeekday(weekday, rhythm));
  const highest = Math.max(...hours, 1);
  const baseline = HEIGHT - LABEL_SPACE;
  const barWidth = (WIDTH - GAP * (WEEK_ORDER.length - 1)) / WEEK_ORDER.length;
  const weeklyHours = hours.reduce((sum, value) => sum + value, 0);

  return {
    width: WIDTH,
    height: HEIGHT,
    baseline,
    weeklyHours,
    summary: `${pluralize(rhythm.weekdayHours, 'hora', 'horas')} de segunda a sexta, ${pluralize(rhythm.saturdayHours, 'hora', 'horas')} no sábado e ${pluralize(rhythm.sundayHours, 'hora', 'horas')} no domingo.`,
    bars: hours.map((value, index) => {
      const height = (value / highest) * (baseline - 14);
      return {
        label: WEEKDAY_SHORT_NAMES[WEEK_ORDER[index] ?? 0],
        hours: value,
        x: index * (barWidth + GAP),
        y: baseline - height,
        width: barWidth,
        height,
        isLong: value === highest && value > rhythm.weekdayHours,
      };
    }),
  };
}
