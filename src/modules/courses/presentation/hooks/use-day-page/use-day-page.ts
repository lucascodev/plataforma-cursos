import { useState } from 'react';
import type { DateKey } from '@/shared/domain/types/date-key.type';
import { useCountdownTimer } from '@/shared/presentation/hooks/use-countdown-timer/use-countdown-timer';
import { formatFullDate } from '@/shared/utils/date/format/format-full-date';
import { exercisePrompt } from '../../../domain/rules/module/exercise-prompt.rule';
import { lessonItemId } from '../../../domain/rules/item-ids/lesson-item-id.rule';
import { describeStudyDay } from '../../formatters/describe-study-day';
import type { StudyContext } from '../../types/study/study-context.type';

const SECONDS_PER_HOUR = 3600;

export function useDayPage({ details, progressState, study }: StudyContext, date: DateKey) {
  const { course } = details;
  const progress = progressState.progress;
  const day = study.plan.dayByDate.get(date) ?? null;
  const [tab, setTab] = useState('tarefa');
  const timer = useCountdownTimer((day?.hours ?? 1) * SECONDS_PER_HOUR);

  if (!day) return { day: null, fallbackPath: `/cursos/${course.slug}/plano` } as const;

  const text = describeStudyDay(course, day);
  const module = day.moduleIndex === null ? undefined : course.modules[day.moduleIndex];
  const lesson = day.lessonIndex === null ? undefined : module?.lessons[day.lessonIndex];
  const previous = study.plan.days[day.index - 1];
  const next = study.plan.days[day.index + 1];
  const base = `/cursos/${course.slug}`;
  const dateLabel = formatFullDate(date);

  return {
    day,
    fallbackPath: `${base}/plano`,
    breadcrumb: [
      { label: 'Hoje', to: `${base}/hoje` },
      ...(module ? [{ label: module.shortTitle, to: `${base}/modulos/${module.id}` }] : []),
      { label: `${dateLabel.charAt(0).toUpperCase()}${dateLabel.slice(1)}` },
    ],
    title: text.title,
    reference: `${text.reference} · ${day.hours} h`,
    detail: text.detail,
    lesson: lesson ? { title: lesson.title, summary: lesson.summary, exerciseText: exercisePrompt(lesson.exercise) } : null,
    // Exercises with a type get their own panel; a plain text exercise stays a paragraph.
    exercise:
      lesson && module && typeof lesson.exercise !== 'string'
        ? { itemKey: lessonItemId(module.id, lesson.id), exercise: lesson.exercise, courseSlug: course.slug, progressState }
        : null,
    tabs: [
      { id: 'tarefa', label: lesson && typeof lesson.exercise !== 'string' ? 'Exercício' : 'Tarefa' },
      ...(lesson ? [{ id: 'aula', label: 'Aula' }] : []),
      { id: 'anotacoes', label: 'Anotações' },
    ],
    tab,
    setTab,
    timer,
    journalText: progress?.journal[date] ?? '',
    setJournal: (value: string) => progressState.actions.setJournalEntry(date, value),
    item: day.itemId && text.itemLabel ? { label: text.itemLabel, isDone: Boolean(progress && day.itemId in progress.completedItems) } : null,
    setItemDone: (done: boolean) => {
      if (day.itemId) progressState.actions.setItemCompleted(day.itemId, done);
    },
    isDayDone: Boolean(progress && date in progress.studyDays),
    setDayDone: (done: boolean) => progressState.actions.setStudyDayDone(date, done),
    previousPath: previous ? `${base}/dia/${previous.date}` : null,
    nextPath: next ? `${base}/dia/${next.date}` : null,
  } as const;
}
