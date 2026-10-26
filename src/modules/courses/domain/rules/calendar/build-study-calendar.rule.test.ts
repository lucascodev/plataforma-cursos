import { describe, expect, it } from 'vitest';
import { buildStudyCalendar } from './build-study-calendar.rule';

const input = {
  courseSlug: 'engenharia-de-ia',
  courseTitle: 'Engenharia de IA, do zero',
  courseUrl: 'https://cursos.exemplo.dev/cursos/engenharia-de-ia/hoje',
  startDate: '2026-10-31',
  endDate: '2028-01-31',
  rhythm: { weekdayHours: 1, saturdayHours: 3, sundayHours: 0 },
  stampedAt: '20261026T120000Z',
} as const;

describe('buildStudyCalendar', () => {
  const ics = buildStudyCalendar(input);

  it('cria um evento semanal por bloco com horas, até o fim do plano', () => {
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20280131T235959');
    expect(ics).toContain('DURATION:PT3H');
    expect(ics).not.toContain('UID:engenharia-de-ia-domingo');
  });

  it('começa no primeiro dia do bloco a partir do início', () => {
    expect(ics).toContain('DTSTART:20261031T190000');
    expect(ics).toContain('DTSTART:20261102T190000');
  });

  it('escapa vírgulas e usa CRLF', () => {
    expect(ics).toContain('SUMMARY:Estudar Engenharia de IA\\, do zero: sessão longa');
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR');
  });
});
