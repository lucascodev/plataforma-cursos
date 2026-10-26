import type { CourseModule } from '../../../entities/course/module/course-module.entity';
import type { StudyTask } from '../../../entities/plan/study-task.entity';
import { lessonItemId } from '../../item-ids/lesson-item-id.rule';
import { createStudyTask } from './create-study-task.rule';
import { splitLessonDays } from './split-lesson-days.rule';

export function buildLessonTasks(module: CourseModule, moduleIndex: number, lessonIndex: number, dayCount: number): StudyTask[] {
  const { study, exercise, review } = splitLessonDays(dayCount);
  const base = { moduleIndex, lessonIndex };
  const tasks: StudyTask[] = [
    ...Array.from({ length: study }, (_, i) => createStudyTask({ ...base, kind: 'lesson-study', part: i + 1, parts: study })),
    ...Array.from({ length: exercise }, (_, i) => createStudyTask({ ...base, kind: 'lesson-exercise', part: i + 1, parts: exercise })),
    ...Array.from({ length: review }, () => createStudyTask({ ...base, kind: 'lesson-review' })),
  ];
  const last = tasks.at(-1);
  const lesson = module.lessons[lessonIndex];
  if (last && lesson) tasks[tasks.length - 1] = { ...last, itemId: lessonItemId(module.id, lesson.id) };
  return tasks;
}
