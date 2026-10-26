import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { LoadProgressOutputDto } from '../../../application/dtos/load-progress/load-progress-output.dto';
import type { CourseProgress } from '../../../domain/entities/course-progress.entity';
import type { ProgressSnapshot } from '../../../domain/entities/progress-snapshot.entity';
import { createEmptyProgress } from '../../../domain/rules/create-empty-progress.rule';
import { mergeProgress } from '../../../domain/rules/merge/merge-progress.rule';
import { setItemCompletion } from '../../../domain/rules/updates/set-item-completion.rule';
import { setJournalEntry } from '../../../domain/rules/updates/set-journal-entry.rule';
import { setModuleNote } from '../../../domain/rules/updates/set-module-note.rule';
import { deliverProject } from '../../../domain/rules/updates/deliver-project.rule';
import { setProjectCheck } from '../../../domain/rules/updates/set-project-check.rule';
import { setStartDate } from '../../../domain/rules/updates/set-start-date.rule';
import { setStudyDayDone } from '../../../domain/rules/updates/set-study-day-done.rule';
import { makeEraseProgress } from '../../../main/factories/make-erase-progress.factory';
import { makeLoadProgress } from '../../../main/factories/make-load-progress.factory';
import { makeSaveProgress } from '../../../main/factories/make-save-progress.factory';
import { progressQueryKeys } from '../../query-keys/progress-query-keys';
import type { CourseProgressState } from './course-progress-state.type';
import type { SaveState } from './save-state.type';

const SAVE_DELAY_MS = 600;
const RETRY_DELAY_MS = 15_000;

export function useCourseProgress(courseSlug: string): CourseProgressState {
  const session = useAuthSession();
  const userId = session.user?.id ?? null;
  const queryClient = useQueryClient();
  const queryKey = progressQueryKeys.byCourse(courseSlug, userId ?? 'signed-out');
  const query = useQuery({
    queryKey,
    queryFn: () => makeLoadProgress().execute({ courseSlug }),
    enabled: userId !== null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: (failureCount, error) => !(error instanceof SessionExpiredError) && failureCount < 1,
    refetchOnWindowFocus: false,
  });

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const pendingRef = useRef<CourseProgress | null>(null);
  // What the server holds as far as this tab knows: the base for the next save and for merging a conflict.
  const syncedRef = useRef<ProgressSnapshot | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = async () => {
    const pending = pendingRef.current;
    const base = syncedRef.current;
    if (!pending || !base) return;
    pendingRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState('saving');
    try {
      const saved = await makeSaveProgress().execute({ courseSlug, progress: pending, base });
      syncedRef.current = saved;
      const newer = pendingRef.current;
      // Merged with another tab: changes made here while the save was in flight are re-applied on top of the merged copy.
      const shown = newer ? mergeProgress(pending, newer, saved.progress) : saved.progress;
      if (newer) pendingRef.current = shown;
      if (saved.progress !== pending || newer) queryClient.setQueryData<LoadProgressOutputDto>(queryKey, { progress: shown, revision: saved.revision });
      setSaveState(pendingRef.current ? 'pending' : 'saved');
    } catch (error) {
      pendingRef.current ??= pending;
      setSaveState('error');
      if (error instanceof SessionExpiredError) {
        session.reportSessionExpired();
        return;
      }
      timerRef.current = setTimeout(() => void flush(), RETRY_DELAY_MS);
    }
  };

  useEffect(() => {
    syncedRef.current = null;
  }, [courseSlug, userId]);

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    const flushBeforeLeaving = () => void flushRef.current();
    window.addEventListener('pagehide', flushBeforeLeaving);
    return () => {
      window.removeEventListener('pagehide', flushBeforeLeaving);
      flushBeforeLeaving();
    };
  }, []);

  const update = (change: (progress: CourseProgress) => CourseProgress) => {
    const current = queryClient.getQueryData<LoadProgressOutputDto>(queryKey);
    if (!userId || !current) return;
    syncedRef.current ??= current;
    const next = change(current.progress);
    if (next === current.progress) return;
    queryClient.setQueryData<LoadProgressOutputDto>(queryKey, { ...current, progress: next });
    pendingRef.current = next;
    setSaveState('pending');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  };

  return {
    status: query.isError ? 'error' : query.data ? 'ready' : 'loading',
    progress: query.data?.progress ?? null,
    saveState,
    actions: {
      setItemCompleted: (itemId, completed) => update((progress) => setItemCompletion(progress, itemId, completed)),
      setStudyDayDone: (date, done) => update((progress) => setStudyDayDone(progress, date, done)),
      setModuleNote: (moduleId, text) => update((progress) => setModuleNote(progress, moduleId, text)),
      setJournalEntry: (date, text) => update((progress) => setJournalEntry(progress, date, text)),
      setStartDate: (date, source) => update((progress) => setStartDate(progress, date, source)),
      setProjectCheck: (moduleId, kind, checkId, checked) => update((progress) => setProjectCheck(progress, moduleId, kind, checkId, checked)),
      deliverProject: (moduleId, projectItemId, delivery) => update((progress) => deliverProject(progress, moduleId, projectItemId, delivery)),
      replaceProgress: (progress) => update(() => progress),
      eraseProgress: async () => {
        if (!userId) return;
        pendingRef.current = null;
        if (timerRef.current) clearTimeout(timerRef.current);
        await makeEraseProgress().execute({ courseSlug });
        const empty = { progress: createEmptyProgress(), revision: 0 };
        syncedRef.current = empty;
        queryClient.setQueryData<LoadProgressOutputDto>(queryKey, empty);
        setSaveState('idle');
      },
      retryLoading: () => void query.refetch(),
    },
  };
}
