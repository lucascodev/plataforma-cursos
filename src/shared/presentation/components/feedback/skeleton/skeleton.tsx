import styles from './skeleton.module.css';

interface SkeletonProps {
  readonly width?: string;
  readonly height?: string;
  readonly radius?: 'sm' | 'md' | 'pill';
}

export function Skeleton({ width = '100%', height = '16px', radius = 'sm' }: SkeletonProps) {
  return <span className={`${styles.skeleton} ${styles[radius]}`} style={{ width, height }} aria-hidden="true" />;
}
