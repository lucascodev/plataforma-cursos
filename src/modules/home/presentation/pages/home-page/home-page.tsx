import { FeaturedCourse } from '../../components/featured-course/featured-course';
import { HomeHero } from '../../components/home-hero/home-hero';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { OpenSource } from '../../components/open-source/open-source';
import { ProgressPromises } from '../../components/progress-promises/progress-promises';
import { useHomePage } from '../../hooks/use-home-page/use-home-page';

export function HomePage() {
  const home = useHomePage();
  return (
    <div data-layout="full">
      <title>{home.site.name}</title>
      <HomeHero todaySample={home.todaySample} />
      <HowItWorks />
      {home.featured ? <FeaturedCourse course={home.featured} /> : null}
      <ProgressPromises />
      <OpenSource repositoryUrl={home.site.repositoryUrl} guideUrl={home.guideUrl} codeLicense={home.site.codeLicense} contentLicense={home.site.contentLicense} />
    </div>
  );
}
