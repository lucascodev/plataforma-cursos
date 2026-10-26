import { Button } from '@/shared/presentation/components/actions/button/button';
import { SectionHeading } from '@/shared/presentation/components/layout/section-heading/section-heading';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { useCoursePreview } from '../../hooks/use-course-preview/use-course-preview';
import { CourseGuide } from '../course-guide/course-guide';
import { CourseHero } from '../course-hero/course-hero';
import styles from './course-preview.module.css';

interface CoursePreviewProps {
  details: CourseDetailsOutputDto;
  isCheckingSession: boolean;
  onSignIn: () => void;
}

export function CoursePreview({ details, isCheckingSession, onSignIn }: CoursePreviewProps) {
  const { course } = details;
  const preview = useCoursePreview(details);

  return (
    <div className={styles.preview}>
      <title>{course.title}</title>
      <CourseHero title={course.title} tagline={course.tagline} description={course.description} facts={preview.facts} author={course.author}>
        <Button tone="primary" disabled={isCheckingSession} onClick={onSignIn}>
          Entrar com GitHub para começar
        </Button>
        <span className={styles.note}>O plano diário, o progresso e o diário ficam salvos na sua conta.</span>
      </CourseHero>

      <section className={styles.section} aria-labelledby="secao-modulos">
        <SectionHeading id="secao-modulos" title="Módulos" />
        <ol className={styles.modules}>
          {preview.modules.map((module) => (
            <li key={module.id} className={styles.module}>
              <span className={styles.label}>{module.label}</span>
              <span className={styles.moduleTitle}>{module.title}</span>
              <span className={styles.meta}>{module.meta}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="secao-guia">
        <SectionHeading id="secao-guia" title="Guia do curso" />
        <CourseGuide guide={course.guide} rhythm={preview.rhythm} />
      </section>
    </div>
  );
}
