import type { CourseModule } from '../../entities/course/module/course-module.entity';
import { drillItemId } from './drill-item-id.rule';
import { lessonItemId } from './lesson-item-id.rule';
import { projectItemId } from './project-item-id.rule';

export function listModuleItemIds(module: CourseModule): string[] {
  return [
    ...module.lessons.map((_, index) => lessonItemId(module.id, index)),
    ...module.drills.map((_, index) => drillItemId(module.id, index)),
    projectItemId(module.id),
  ];
}
