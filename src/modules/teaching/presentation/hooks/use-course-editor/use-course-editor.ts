import { runCourseChecks } from '@contracts/course/checks/run-course-checks';
import { diffCourseVersions } from '@contracts/version/diff/diff-course-versions';
import { useCallback, useEffect, useRef, useState } from 'react';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { useLeaveWarning } from '@/shared/presentation/hooks/use-leave-warning/use-leave-warning';
import { VersionConflictError } from '../../../application/errors/version-conflict.error';
import type { EditableCourse } from '../../../domain/entities/draft/editable-course.entity';
import type { OpenVersion } from '../../../domain/entities/versions/open-version.entity';
import { normalizeCourseDraft } from '../../../domain/rules/draft/normalize-course-draft.rule';
import { canEditVersion } from '../../../domain/rules/version/can-edit-version.rule';
import { makeSaveDraft } from '../../../main/factories/make-save-draft.factory';
import type { CourseEditor } from '../../types/course-editor.type';
import type { SaveStatus } from '../../types/save-status.type';

const AUTOSAVE_DELAY_MS = 1200;

// Keeps the editor's copy of the draft and saves it a moment after the person stops typing. Saves never overlap, and
// each one sends the revision of the previous answer, so a second tab editing the same draft is caught as a conflict.
export function useCourseEditor(slug: string, version: OpenVersion, publishedContent: unknown): CourseEditor {
  const [course, setCourse] = useState(() => normalizeCourseDraft(version.content, makeClock().today()));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const latest = useRef(course);
  const revision = useRef(version.revision);
  const isDirty = useRef(false);
  const inFlight = useRef<Promise<number | null> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditable = canEditVersion(version);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const saveOnce = useCallback(async (): Promise<number | null> => {
    isDirty.current = false;
    setSaveStatus('saving');
    try {
      revision.current = await makeSaveDraft().execute({ slug, versionId: version.id, revision: revision.current, content: latest.current });
      setSaveStatus(isDirty.current ? 'pending' : 'saved');
      return revision.current;
    } catch (error) {
      isDirty.current = true;
      setSaveStatus(error instanceof VersionConflictError ? 'conflict' : 'error');
      return null;
    }
  }, [slug, version.id]);

  const flush = useCallback(async (): Promise<number | null> => {
    clearTimer();
    if (inFlight.current) await inFlight.current;
    if (!isDirty.current) return revision.current;
    inFlight.current = saveOnce();
    const saved = await inFlight.current;
    inFlight.current = null;
    return saved;
  }, [saveOnce]);

  const update = useCallback(
    (change: (current: EditableCourse) => EditableCourse) => {
      if (!isEditable || saveStatus === 'conflict') return;
      latest.current = change(latest.current);
      setCourse(latest.current);
      isDirty.current = true;
      setSaveStatus('pending');
      clearTimer();
      timer.current = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    },
    [flush, isEditable, saveStatus],
  );

  // Sending or withdrawing raises the revision on the server; pick it up when nothing local is waiting.
  useEffect(() => {
    if (!isDirty.current && !inFlight.current && version.revision > revision.current) revision.current = version.revision;
  }, [version.revision, version.status]);

  // Leaving the editor inside the app saves what is pending instead of dropping it.
  useEffect(() => () => void flush(), [flush]);

  useLeaveWarning(saveStatus !== 'saved');

  return {
    course,
    isEditable,
    saveStatus,
    checks: runCourseChecks(course),
    diff: diffCourseVersions(publishedContent, course),
    update,
    flush,
  };
}
