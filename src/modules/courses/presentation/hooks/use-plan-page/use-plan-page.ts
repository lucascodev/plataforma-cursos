import { useMemo, useState } from 'react';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import { addMonths } from '@/shared/utils/date/calendar/add-months';
import { monthWeeks } from '@/shared/utils/date/calendar/month-weeks';
import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { formatMonthTitle } from '@/shared/utils/date/format/format-month-title';
import { WEEKDAY_SHORT_NAMES } from '@/shared/utils/date/names/weekday-short-names';
import { pluralize } from '@/shared/utils/text/pluralize';
import { isDateKey } from '@contracts/date/is-date-key';
import { planSpan } from '../../../domain/rules/plan/plan-span.rule';
import { studyDayStatus } from '../../../domain/rules/plan/study-day-status.rule';
import { makeBuildStudyPlan } from '../../../main/factories/make-build-study-plan.factory';
import { describeStudyDay } from '../../formatters/describe-study-day';
import type { StudyContext } from '../../types/study/study-context.type';

const monthOf = (date: DateKey) => date.slice(0, 7);
const STATUS_LABELS = { done: 'Feito', today: 'Hoje', late: 'Em atraso', upcoming: 'A fazer' } as const;

export function usePlanPage({ details, progressState, study }: StudyContext) {
  const { course } = details;
  const { plan, today } = study;
  const progress = progressState.progress;
  const toast = useToast();
  const span = planSpan(plan);

  const [view, setView] = useState<'month' | 'list'>('month');
  const [month, setMonth] = useState(() => monthOf(today < span.firstDate ? span.firstDate : today > span.lastDate ? span.lastDate : today));
  const [selectedDate, setSelectedDate] = useState<DateKey>(() => (plan.dayByDate.has(today) ? today : span.firstDate));
  const [restartDate, setRestartDate] = useState<DateKey>(today);
  const [isConfirmingRestart, setIsConfirmingRestart] = useState(false);
  const restartSpan = useMemo(() => planSpan(makeBuildStudyPlan().execute({ course, startDate: restartDate })), [course, restartDate]);

  const describeDay = (date: DateKey) => {
    const day = plan.dayByDate.get(date);
    if (!day) return null;
    const text = describeStudyDay(course, day);
    const status = studyDayStatus(date, Boolean(progress && date in progress.studyDays), today);
    return { date, day: Number(date.slice(8)), title: text.title, reference: text.reference, hours: `${day.hours} h`, status, statusLabel: STATUS_LABELS[status] };
  };

  const selected = describeDay(selectedDate);
  const monthDays = plan.days.filter((day) => day.date.startsWith(month)).map((day) => describeDay(day.date)).filter((day) => day !== null);

  return {
    summary: `${pluralize(span.studyDays, 'dia', 'dias')} · ${formatDayMonthYear(span.firstDate)} a ${formatDayMonthYear(span.lastDate)}`,
    view,
    setView,
    monthTitle: formatMonthTitle(month),
    canGoBack: month > monthOf(span.firstDate),
    canGoForward: month < monthOf(span.lastDate),
    previousMonth: () => setMonth((current) => addMonths(current, -1)),
    nextMonth: () => setMonth((current) => addMonths(current, 1)),
    goToToday: () => {
      setMonth(monthOf(today));
      if (plan.dayByDate.has(today)) setSelectedDate(today);
    },
    weekdayLabels: [1, 2, 3, 4, 5, 6, 0].map((weekday) => WEEKDAY_SHORT_NAMES[weekday] ?? ''),
    weeks: monthWeeks(month).map((week) =>
      week.map((date) => ({ date, inMonth: date.startsWith(month), isSelected: date === selectedDate, info: date.startsWith(month) ? describeDay(date) : null })),
    ),
    monthDays,
    select: setSelectedDate,
    selected: selected ? { ...selected, label: formatFullDate(selected.date), dayPath: `/cursos/${course.slug}/dia/${selected.date}` } : null,
    restart: {
      date: restartDate,
      setDate: (value: string) => {
        if (isDateKey(value)) setRestartDate(value);
      },
      currentEnd: formatDayMonthYear(span.lastDate),
      newEnd: formatDayMonthYear(restartSpan.lastDate),
      isConfirming: isConfirmingRestart,
      ask: () => setIsConfirmingRestart(true),
      cancel: () => setIsConfirmingRestart(false),
      confirm: () => {
        progressState.actions.setStartDate(restartDate, 'user');
        setIsConfirmingRestart(false);
        setMonth(monthOf(restartDate));
        setSelectedDate(restartDate);
        toast.show({ text: `Plano refeito a partir de ${formatDayMonthYear(restartDate)}.` });
      },
    },
  };
}
