import type { CatalogSearchable } from '../../types/catalog-searchable.type';
import type { CourseLevelKey } from '../../types/course-level-key.type';
import { courseLevelKey } from './course-level-key.rule';
import { matchesCatalogQuery } from './matches-catalog-query.rule';

export function filterCatalog<T extends CatalogSearchable>(courses: readonly T[], query: string, level: CourseLevelKey | null): T[] {
  return courses.filter((course) => (level === null || courseLevelKey(course.level) === level) && matchesCatalogQuery(course, query));
}
