import { defaultDrillId } from '../../course/item-ids/default-drill-id.ts';
import { defaultLessonId } from '../../course/item-ids/default-lesson-id.ts';
import type { CourseChange } from './course-change.type.ts';
import type { CourseDiff } from './course-diff.type.ts';
import { isSameValue } from './is-same-value.ts';

type Loose = Record<string, unknown>;

const INFO_FIELDS: readonly (readonly [string, string])[] = [
  ['title', 'título'],
  ['tagline', 'frase curta'],
  ['description', 'descrição'],
  ['level', 'nível'],
  ['audience', 'para quem é'],
];
const RHYTHM_FIELDS = ['rhythm', 'kickoff', 'sundayTrack'] as const;
const MODULE_DETAIL_FIELDS = ['shortTitle', 'title', 'kind', 'months', 'projectDays', 'prerequisite', 'goal', 'caseStudy', 'lowSpecTip', 'selfCheck', 'resources'];

const asRecord = (value: unknown): Loose => (value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Loose) : {});
const asList = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);
const same = (a: unknown, b: unknown) => isSameValue(a ?? null, b ?? null);
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function itemsById(items: unknown, defaultId: (index: number) => string): Map<string, unknown> {
  return new Map(asList(items).map((item, index) => [String(asRecord(item).id ?? defaultId(index)), item]));
}

function compareItems(before: unknown, after: unknown, defaultId: (index: number) => string) {
  const old = itemsById(before, defaultId);
  const next = itemsById(after, defaultId);
  const removed = [...old.keys()].filter((id) => !next.has(id));
  const added = [...next.keys()].filter((id) => !old.has(id)).length;
  const edited = [...next.entries()].filter(([id, item]) => old.has(id) && !same(old.get(id), item)).length;
  return { removed, added, edited };
}

function compareModule(code: string, before: Loose, after: Loose): { change: CourseChange | null; removedKeys: string[] } {
  const moduleId = String(after.id);
  const lessons = compareItems(before.lessons, after.lessons, defaultLessonId);
  const drills = compareItems(before.drills, after.drills, defaultDrillId);
  const removedKeys = [...lessons.removed, ...drills.removed].map((itemId) => `${moduleId}-${itemId}`);
  const parts = [
    lessons.added ? plural(lessons.added, 'aula nova', 'aulas novas') : '',
    lessons.removed.length ? plural(lessons.removed.length, 'aula removida', 'aulas removidas') : '',
    lessons.edited ? plural(lessons.edited, 'aula revisada', 'aulas revisadas') : '',
    drills.added + drills.removed.length + drills.edited ? 'exercícios de fixação alterados' : '',
    same(before.project, after.project) ? '' : 'projeto revisado',
    MODULE_DETAIL_FIELDS.some((field) => !same(before[field], after[field])) ? 'detalhes do módulo revisados' : '',
  ].filter(Boolean);
  const change: CourseChange | null =
    parts.length === 0 ? null : { area: 'modules', text: `${code} · ${String(after.shortTitle ?? after.title ?? moduleId)}: ${parts.join(', ')}` };
  return { change, removedKeys };
}

// What a new version changes compared with the published one. Both sides are read defensively: a draft may be incomplete.
export function diffCourseVersions(published: unknown, draft: unknown): CourseDiff {
  const before = asRecord(published);
  const after = asRecord(draft);
  const changes: CourseChange[] = [];
  const removedItemKeys: string[] = [];

  const changedInfo = INFO_FIELDS.filter(([field]) => !same(before[field], after[field])).map(([, label]) => label);
  if (changedInfo.length > 0) changes.push({ area: 'info', text: `Informações: ${changedInfo.join(', ')}` });

  const oldModules = new Map(asList(before.modules).map((module) => [String(asRecord(module).id), asRecord(module)]));
  const newModuleIds = new Set(asList(after.modules).map((module) => String(asRecord(module).id)));
  asList(after.modules).forEach((value, index) => {
    const module = asRecord(value);
    const code = `M${index + 1}`;
    const previous = oldModules.get(String(module.id));
    if (!previous) {
      changes.push({ area: 'modules', text: `Módulo novo: ${code} · ${String(module.title ?? module.id)}` });
      return;
    }
    const { change, removedKeys } = compareModule(code, previous, module);
    if (change) changes.push(change);
    removedItemKeys.push(...removedKeys);
  });
  oldModules.forEach((module, id) => {
    if (newModuleIds.has(id)) return;
    changes.push({ area: 'modules', text: `Módulo removido: ${String(module.title ?? id)}` });
    asList(module.lessons).forEach((lesson, index) => removedItemKeys.push(`${id}-${String(asRecord(lesson).id ?? defaultLessonId(index))}`));
    asList(module.drills).forEach((drill, index) => removedItemKeys.push(`${id}-${String(asRecord(drill).id ?? defaultDrillId(index))}`));
  });

  if (!same(before.guide, after.guide)) changes.push({ area: 'guide', text: 'Guia revisado' });
  if (RHYTHM_FIELDS.some((field) => !same(before[field], after[field]))) changes.push({ area: 'rhythm', text: 'Ritmo e plano alterados' });

  return { changes, removedItemKeys };
}
