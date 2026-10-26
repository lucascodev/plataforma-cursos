import styles from './progress-meter.module.css';

interface ProgressMeterProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

export function ProgressMeter({ value, max, label, className }: ProgressMeterProps) {
  return (
    <progress className={[styles.meter, className].filter(Boolean).join(' ')} value={value} max={Math.max(max, 1)} aria-label={label}>
      {value} de {max}
    </progress>
  );
}
