import { planTuning } from '../../../constants/plan-tuning';
import type { CourseModule } from '../../../entities/course/module/course-module.entity';
import type { StudyTask } from '../../../entities/plan/study-task.entity';
import { drillItemId } from '../../item-ids/drill-item-id.rule';
import { buildLessonTasks } from './build-lesson-tasks.rule';
import { buildProjectTasks } from './build-project-tasks.rule';
import { createStudyTask } from './create-study-task.rule';
import { weeksForModule } from '../schedule/weeks-for-module.rule';

export function buildModuleTasks(module: CourseModule, moduleIndex: number): StudyTask[] {
  const totalDays = weeksForModule(module) * planTuning.studyDaysPerWeek;
  const projectDays = module.projectDays ?? Math.max(planTuning.minimumProjectDays, Math.round(totalDays * planTuning.projectShare));
  const selfCheckDays = 1;
  const lessonDays = Math.max(0, totalDays - projectDays - module.drills.length - selfCheckDays);
  const lessonCount = module.lessons.length;
  const baseDays = lessonCount ? Math.floor(lessonDays / lessonCount) : 0;
  const extraDays = lessonDays - baseDays * lessonCount;

  return [
    ...module.lessons.flatMap((_, lessonIndex) =>
      buildLessonTasks(module, moduleIndex, lessonIndex, baseDays + (lessonIndex < extraDays ? 1 : 0)),
    ),
    ...module.drills.map((_, drillIndex) =>
      createStudyTask({ kind: 'drill', moduleIndex, drillIndex, itemId: drillItemId(module.id, drillIndex) }),
    ),
    ...buildProjectTasks(module, moduleIndex, projectDays),
    createStudyTask({ kind: 'self-check', moduleIndex }),
  ];
}
