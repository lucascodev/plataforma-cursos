import type { ArchitectureDiagram as ArchitectureDiagramData } from '../../../../../domain/entities/guide/architecture-diagram.entity';
import styles from './architecture-diagram.module.css';

interface ArchitectureDiagramProps {
  diagram: ArchitectureDiagramData;
}

export function ArchitectureDiagram({ diagram }: ArchitectureDiagramProps) {
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <strong>{diagram.title}</strong>
        <span>{diagram.description}</span>
      </figcaption>
      <div className={styles.rows}>
        {diagram.rows.map((row, rowIndex) => (
          <ol key={rowIndex} className={styles.row}>
            {row.map((node) => (
              <li key={node.title} className={node.highlight ? `${styles.node} ${styles.highlight}` : styles.node}>
                <span className={styles.nodeTitle}>{node.title}</span>
                <span className={styles.nodeDetail}>{node.detail}</span>
              </li>
            ))}
          </ol>
        ))}
      </div>
      {diagram.bands.length > 0 ? (
        <ul className={styles.bands}>
          {diagram.bands.map((band) => (
            <li key={band.text} className={band.tone === 'warning' ? `${styles.band} ${styles.warning}` : styles.band}>
              {band.text}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
