import { foldAccents } from '@/shared/utils/text/fold-accents';
import type { CatalogSearchable } from '../../types/catalog-searchable.type';

// Every word of the query must appear somewhere in the course, accents and case ignored.
export function matchesCatalogQuery(course: CatalogSearchable, query: string): boolean {
  const words = foldAccents(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = foldAccents(
    [course.title, course.tagline, course.description, course.level, course.audience, ...course.modules.flatMap((module) => [module.title, module.shortTitle, module.projectTitle])].join(' '),
  );
  return words.every((word) => haystack.includes(word));
}
