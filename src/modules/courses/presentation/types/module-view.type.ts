import type { CourseModuleKind } from '../../domain/entities/course/course-module-kind.type';
import type { Resource } from '../../domain/entities/course/resource.entity';
import type { ModuleItemView } from './module-item-view.type';

export interface ModuleView {
  readonly id: string;
  readonly number: number;
  readonly kind: CourseModuleKind;
  readonly shortTitle: string;
  readonly title: string;
  readonly subtitle: string;
  readonly completed: number;
  readonly total: number;
  readonly isCurrent: boolean;
  readonly isComplete: boolean;
  readonly goal: string;
  readonly prerequisite: string;
  readonly caseStudy: string;
  readonly lowSpecTip: string | null;
  readonly lessons: readonly (ModuleItemView & { readonly summary: string; readonly exercise: string })[];
  readonly drills: readonly (ModuleItemView & { readonly task: string })[];
  readonly project: ModuleItemView & { readonly brief: string; readonly requirements: readonly string[]; readonly doneCriteria: readonly string[] };
  readonly selfCheck: readonly string[];
  readonly resources: readonly Resource[];
  readonly note: string;
}
