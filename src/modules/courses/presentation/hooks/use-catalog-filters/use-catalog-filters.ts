import { useState } from 'react';
import type { CourseSummaryOutputDto } from '../../../application/dtos/list-courses/course-summary-output.dto';
import { filterCatalog } from '../../../domain/rules/catalog/filter-catalog.rule';
import type { CourseLevelKey } from '../../../domain/types/course-level-key.type';

export function useCatalogFilters(courses: readonly CourseSummaryOutputDto[]) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<CourseLevelKey | null>(null);
  const visible = filterCatalog(courses, query, level);
  const trimmedQuery = query.trim();

  return {
    query,
    level,
    visible,
    emptyTitle: trimmedQuery ? `Nenhum curso encontrado para "${trimmedQuery}"` : 'Ainda não há curso nesse nível',
    setQuery,
    setLevel,
    clear: () => {
      setQuery('');
      setLevel(null);
    },
  };
}
