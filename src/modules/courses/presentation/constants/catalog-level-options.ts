import type { CourseLevelKey } from '../../domain/types/course-level-key.type';

export const CATALOG_LEVEL_OPTIONS: readonly { readonly key: CourseLevelKey | null; readonly label: string }[] = [
  { key: null, label: 'Todos' },
  { key: 'iniciante', label: 'Iniciante' },
  { key: 'intermediario', label: 'Intermediário' },
  { key: 'avancado', label: 'Avançado' },
];
