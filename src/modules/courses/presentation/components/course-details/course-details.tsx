import { SectionNav } from '@/shared/presentation/components/navigation/section-nav/section-nav';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { COURSE_DETAILS_SECTIONS } from '../../constants/course-details-sections';
import { useCourseDetailsPage } from '../../hooks/use-course-details-page/use-course-details-page';
import { CourseDetailsHero } from '../course-details-hero/course-details-hero';
import { CourseGuide } from '../course-guide/course-guide';
import { ModuleAccordion } from '../module-accordion/module-accordion';
import { PlanBox } from '../plan-box/plan-box';
import styles from './course-details.module.css';

export function CourseDetails({ details }: { readonly details: CourseDetailsOutputDto }) {
  const { course } = details;
  const page = useCourseDetailsPage(details);

  return (
    <div data-layout="full">
      <title>{course.title}</title>
      <CourseDetailsHero
        course={course}
        facts={page.facts}
        aside={
          <PlanBox
            startDate={page.plan.startDate}
            studyDaysLabel={page.plan.studyDaysLabel}
            rangeLabel={page.plan.rangeLabel}
            action={page.action}
            startPath={page.startPath}
            todayPath={page.todayPath}
            onStartDateChange={page.plan.setStartDate}
            onSignIn={page.signIn}
          />
        }
      />
      <SectionNav label="Seções do curso" sections={COURSE_DETAILS_SECTIONS} />
      <div className={styles.content}>
        <section id="modulos" className={styles.section} aria-labelledby="modulos-titulo">
          <div className={styles.heading}>
            <h2 id="modulos-titulo" className={styles.title}>
              Módulos
            </h2>
            <p className={styles.lead}>Abra um módulo para ver o objetivo e as aulas.</p>
          </div>
          <ModuleAccordion modules={page.modules} />
        </section>
        <section id="guia" className={styles.section} aria-labelledby="guia-titulo">
          <div className={styles.heading}>
            <h2 id="guia-titulo" className={styles.title}>
              Ritmo e guia do curso
            </h2>
            <p className={styles.lead}>{page.rhythm.summary}</p>
          </div>
          <CourseGuide guide={course.guide} rhythm={page.rhythm} />
        </section>
      </div>
    </div>
  );
}
