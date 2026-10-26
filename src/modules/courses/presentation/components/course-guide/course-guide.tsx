import type { CourseGuide as CourseGuideData } from '../../../domain/entities/guide/course-guide.entity';
import type { RhythmView } from '../../types/plan/rhythm-view.type';
import styles from './course-guide.module.css';
import { ArchitectureDiagram } from './components/architecture-diagram/architecture-diagram';
import { GuideSectionCard } from './components/guide-section-card/guide-section-card';
import { RhythmCard } from './components/rhythm-card/rhythm-card';

interface CourseGuideProps {
  guide: CourseGuideData;
  rhythm: RhythmView;
}

export function CourseGuide({ guide, rhythm }: CourseGuideProps) {
  return (
    <div className={styles.guide}>
      {guide.architecture ? <ArchitectureDiagram diagram={guide.architecture} /> : null}
      <div className={styles.cards}>
        <RhythmCard rhythm={rhythm} />
        {guide.sections.map((section) => (
          <GuideSectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
