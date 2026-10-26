import type { Course } from '../../../entities/course/course.entity';
import type { StudyTask } from '../../../entities/plan/study-task.entity';
import { lessonItemId } from '../../item-ids/lesson-item-id.rule';
import { createStudyTask } from './create-study-task.rule';
import { resolveSundayIndex } from './resolve-sunday-index.rule';

export function buildSundayTask(course: Course, sundayIndex: number, totalSundays: number): StudyTask {
  const track = course.sundayTrack;
  if (!track) return createStudyTask({ kind: 'sunday-rotation', sundayIndex });

  const moduleIndex = course.modules.findIndex((module) => module.id === track.moduleId);
  const trackModule = course.modules[moduleIndex];
  const milestoneIndex = track.milestones.findIndex(
    (milestone) => resolveSundayIndex(milestone.sunday, totalSundays) === sundayIndex,
  );
  const milestone = track.milestones[milestoneIndex];

  if (milestone) {
    return createStudyTask({
      kind: 'sunday-milestone',
      moduleIndex: trackModule ? moduleIndex : null,
      sundayIndex,
      trackEntryIndex: milestoneIndex,
      lessonIndex: milestone.lessonIndex,
      itemId: trackModule && milestone.lessonIndex !== null ? lessonItemId(trackModule.id, milestone.lessonIndex) : null,
    });
  }

  return createStudyTask({
    kind: 'sunday-rotation',
    moduleIndex: trackModule ? moduleIndex : null,
    sundayIndex,
    trackEntryIndex: track.rotation.length ? sundayIndex % track.rotation.length : null,
  });
}
