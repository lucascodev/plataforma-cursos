import { useCourseCatalogQuery } from '@/modules/courses';
import { useProgressSummariesQuery } from '@/modules/progress';
import type { StudySummary } from '../../../domain/entities/studies/study-summary.entity';
import { summarizeStudies } from '../../../domain/rules/summarize-studies.rule';

type MyStudies = { readonly status: 'loading' } | { readonly status: 'error' } | { readonly status: 'ready'; readonly summary: StudySummary };

export function useMyStudies(): MyStudies {
  const progress = useProgressSummariesQuery();
  const catalog = useCourseCatalogQuery();
  if (progress.isError) return { status: 'error' };
  if (progress.isPending) return { status: 'loading' };
  // The catalog only adds titles and totals; without it the summary still shows the raw progress.
  const courses = (catalog.data ?? []).map((course) => ({
    slug: course.slug,
    title: course.title,
    totalItems: course.totals.lessons + course.totals.drills + course.totals.projects,
  }));
  return { status: 'ready', summary: summarizeStudies(progress.data, courses) };
}
