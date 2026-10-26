import type { DateKey } from '@/shared/domain/types/date-key.type';
import { addDays } from '@/shared/utils/date/calendar/add-days';
import { dayOfWeek } from '@/shared/utils/date/calendar/day-of-week';
import type { StudyCalendarInput } from '../../entities/calendar/study-calendar-input.entity';

// Study blocks start at 19:00 in the calendar's own time zone; people move them in their calendar app.
const STUDY_START_TIME = '190000';
const ICS_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
const BLOCKS = [
  { id: 'semana', weekdays: [1, 2, 3, 4, 5], hours: 'weekdayHours', summary: 'aula, exercício ou revisão' },
  { id: 'sabado', weekdays: [6], hours: 'saturdayHours', summary: 'sessão longa' },
  { id: 'domingo', weekdays: [0], hours: 'sundayHours', summary: 'atividade leve' },
] as const;

const compact = (date: DateKey) => date.replaceAll('-', '');
const escapeText = (text: string) => text.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');

function firstDateOn(weekdays: readonly number[], from: DateKey): DateKey {
  let date = from;
  while (!weekdays.includes(dayOfWeek(date))) date = addDays(date, 1);
  return date;
}

export function buildStudyCalendar(input: StudyCalendarInput): string {
  const events = BLOCKS.filter((block) => input.rhythm[block.hours] > 0).flatMap((block) => [
    'BEGIN:VEVENT',
    `UID:${input.courseSlug}-${block.id}@cursos-abertos`,
    `DTSTAMP:${input.stampedAt}`,
    `DTSTART:${compact(firstDateOn(block.weekdays, input.startDate))}T${STUDY_START_TIME}`,
    `DURATION:PT${input.rhythm[block.hours]}H`,
    `RRULE:FREQ=WEEKLY;BYDAY=${block.weekdays.map((day) => ICS_DAYS[day]).join(',')};UNTIL=${compact(input.endDate)}T235959`,
    `SUMMARY:${escapeText(`Estudar ${input.courseTitle}: ${block.summary}`)}`,
    `URL:${input.courseUrl}`,
    'END:VEVENT',
  ]);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cursos Abertos//Plano de estudo//PT', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR', ''].join('\r\n');
}
