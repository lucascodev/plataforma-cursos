import { useCourseCatalogQuery } from '@/modules/courses';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { buildFeaturedCourseView } from './builders/build-featured-course-view';
import { buildTodaySampleView } from './builders/build-today-sample-view';

export function useHomePage() {
  const catalog = useCourseCatalogQuery();
  const site = makeSiteConfig();
  const featured = catalog.data?.[0] ?? null;

  return {
    site,
    guideUrl: `${site.repositoryUrl}/blob/main/docs/criando-um-curso.md`,
    featured: featured ? buildFeaturedCourseView(featured) : null,
    todaySample: featured ? buildTodaySampleView(featured, makeClock().today()) : null,
  };
}
