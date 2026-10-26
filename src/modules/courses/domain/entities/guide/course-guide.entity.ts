import type { ArchitectureDiagram } from './architecture-diagram.entity';
import type { GuideSection } from './guide-section.entity';

export interface CourseGuide {
  readonly architecture: ArchitectureDiagram | null;
  readonly sections: readonly GuideSection[];
}
