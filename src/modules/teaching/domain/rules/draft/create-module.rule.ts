import type { EditableModule } from '../../entities/draft/editable-module.entity';

export function createModule(existing: readonly EditableModule[]): EditableModule {
  const taken = new Set(existing.map((module) => module.id));
  let number = existing.length + 1;
  while (taken.has(`m${number}`)) number += 1;
  return {
    id: `m${number}`,
    shortTitle: '',
    title: '',
    kind: 'standard',
    months: 1,
    prerequisite: '',
    goal: '',
    caseStudy: '',
    lessons: [],
    drills: [],
    project: { title: '', brief: '', requirements: [], doneCriteria: [] },
    selfCheck: [],
    resources: [],
  };
}
