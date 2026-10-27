import type { EditableModule } from '../../entities/draft/editable-module.entity';

export function moduleItemIds(module: EditableModule): ReadonlySet<string> {
  return new Set([...module.lessons.map((lesson) => lesson.id ?? ''), ...module.drills.map((drill) => drill.id ?? '')]);
}
