import type { CourseModuleKind } from './course-module-kind.type';
import type { Drill } from './drill.entity';
import type { Lesson } from './lesson.entity';
import type { ModuleProject } from './module-project.entity';
import type { Resource } from './resource.entity';

export interface CourseModule {
  readonly id: string;
  readonly shortTitle: string;
  readonly title: string;
  readonly kind: CourseModuleKind;
  readonly months: number;
  readonly projectDays: number | null;
  readonly prerequisite: string;
  readonly goal: string;
  readonly caseStudy: string;
  readonly lowSpecTip: string | null;
  readonly lessons: readonly Lesson[];
  readonly drills: readonly Drill[];
  readonly project: ModuleProject;
  readonly selfCheck: readonly string[];
  readonly resources: readonly Resource[];
}
