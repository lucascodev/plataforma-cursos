import type { CourseProgress } from '../entities/course-progress.entity';
import { setTextEntry } from './set-text-entry.rule';

export function setModuleNote(progress: CourseProgress, moduleId: string, text: string): CourseProgress {
  return { ...progress, moduleNotes: setTextEntry(progress.moduleNotes, moduleId, text) };
}
