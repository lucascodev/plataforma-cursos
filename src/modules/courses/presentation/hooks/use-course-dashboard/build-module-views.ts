import { formatMonthYear } from '@/shared/utils/date/format/format-month-year';
import type { CourseProgress } from '@/modules/progress';
import type { Course } from '../../../domain/entities/course/course.entity';
import type { StudyPlan } from '../../../domain/entities/plan/study-plan.entity';
import { drillItemId } from '../../../domain/rules/item-ids/drill-item-id.rule';
import { lessonItemId } from '../../../domain/rules/item-ids/lesson-item-id.rule';
import { projectItemId } from '../../../domain/rules/item-ids/project-item-id.rule';
import { weeksForModule } from '../../../domain/rules/plan/weeks-for-module.rule';
import { calculateModuleCompletion } from '../../../domain/rules/summary/calculate-module-completion.rule';
import type { ModuleView } from '../../types/module-view.type';

export function buildModuleViews(course: Course, plan: StudyPlan, progress: CourseProgress, currentModuleIndex: number): ModuleView[] {
  const isCompleted = (itemId: string) => itemId in progress.completedItems;
  const hoursPerWeek = course.rhythm.weekdayHours * 5 + course.rhythm.saturdayHours;

  return course.modules.map((module, index) => {
    const number = index + 1;
    const range = plan.moduleRanges.get(index);
    const { completed, total } = calculateModuleCompletion(module, isCompleted);
    const lessonCount = `${module.lessons.length} ${module.lessons.length === 1 ? 'aula' : 'aulas'}`;
    const subtitle =
      module.months > 0 && range
        ? `${lessonCount} · ≈ ${weeksForModule(module) * hoursPerWeek} h · ${formatMonthYear(range.first)} a ${formatMonthYear(range.last)}`
        : `${lessonCount} · aos domingos, ao longo de todo o curso`;
    const projectId = projectItemId(module.id);

    return {
      id: module.id,
      number,
      kind: module.kind,
      shortTitle: module.shortTitle,
      title: module.title,
      subtitle,
      completed,
      total,
      isCurrent: index === currentModuleIndex && completed < total,
      isComplete: completed === total,
      goal: module.goal,
      prerequisite: module.prerequisite,
      caseStudy: module.caseStudy,
      lowSpecTip: module.lowSpecTip,
      lessons: module.lessons.map((lesson, lessonIndex) => {
        const itemId = lessonItemId(module.id, lessonIndex);
        return { itemId, number: `${number}.${lessonIndex + 1}`, title: lesson.title, summary: lesson.summary, exercise: lesson.exercise, isDone: isCompleted(itemId) };
      }),
      drills: module.drills.map((drill, drillIndex) => {
        const itemId = drillItemId(module.id, drillIndex);
        return { itemId, number: `${number}.${drillIndex + 1}`, title: drill.title, task: drill.task, isDone: isCompleted(itemId) };
      }),
      project: {
        itemId: projectId,
        number: String(number),
        title: module.project.title,
        brief: module.project.brief,
        requirements: module.project.requirements,
        doneCriteria: module.project.doneCriteria,
        isDone: isCompleted(projectId),
      },
      selfCheck: module.selfCheck,
      resources: module.resources,
      note: progress.moduleNotes[module.id] ?? '',
    };
  });
}
