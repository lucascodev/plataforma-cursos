import type { CourseModule } from '../../../entities/course/module/course-module.entity';
import type { StudyTask } from '../../../entities/plan/study-task.entity';
import { projectItemId } from '../../item-ids/project-item-id.rule';
import { createStudyTask } from './create-study-task.rule';

export function buildProjectTasks(module: CourseModule, moduleIndex: number, dayCount: number): StudyTask[] {
  const buildDays = Math.max(0, dayCount - 3);
  const requirementCount = Math.max(1, module.project.requirements.length);

  return Array.from({ length: dayCount }, (_, day) => {
    if (day === 0) return createStudyTask({ kind: 'project-plan', moduleIndex });
    if (day === dayCount - 1) return createStudyTask({ kind: 'project-publish', moduleIndex, itemId: projectItemId(module.id) });
    if (day === dayCount - 2) return createStudyTask({ kind: 'project-evaluate', moduleIndex });
    return createStudyTask({
      kind: 'project-build',
      moduleIndex,
      part: day,
      parts: buildDays,
      requirementIndex: (day - 1) % requirementCount,
    });
  });
}
