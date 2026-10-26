import type { ArchitectureBand } from './architecture-band.entity';
import type { ArchitectureNode } from './architecture-node.entity';

export interface ArchitectureDiagram {
  readonly title: string;
  readonly description: string;
  readonly rows: readonly (readonly ArchitectureNode[])[];
  readonly bands: readonly ArchitectureBand[];
}
