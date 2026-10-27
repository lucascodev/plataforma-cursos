import { useAuthSession } from '@/modules/auth';
import { useCourseCatalogQuery } from '@/modules/courses';
import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { buildFeaturedCourseView } from './builders/build-featured-course-view';
import { buildTodaySampleView } from './builders/build-today-sample-view';

export function useHomePage() {
  const catalog = useCourseCatalogQuery();
  const session = useAuthSession();
  const site = makeSiteConfig();
  const featured = catalog.data?.[0] ?? null;

  return {
    site,
    account: session.status === 'loading' ? null : session.user ? ({ label: 'Meus estudos', to: '/perfil/estudos' } as const) : ({ label: 'Entrar com GitHub', to: '/entrar' } as const),
    featured: featured ? buildFeaturedCourseView(featured) : null,
    todaySample: featured ? buildTodaySampleView(featured, makeClock().today()) : null,
  };
}
