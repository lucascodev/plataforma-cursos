import type { PlanCurveView } from '../../../../types/plan-curve-view.type';
import styles from './plan-curve.module.css';

interface PlanCurveProps {
  curve: PlanCurveView;
}

export function PlanCurve({ curve }: PlanCurveProps) {
  return (
    <figure className={styles.figure}>
      <svg className={styles.svg} viewBox={`0 0 ${curve.width} ${curve.height}`} role="img" aria-labelledby="plan-curve-caption">
        {curve.yTicks.map((tick) => (
          <g key={tick.label}>
            <line className={styles.grid} x1={curve.plotLeft} x2={curve.plotRight} y1={tick.y} y2={tick.y} />
            <text className={styles.tick} x={curve.plotLeft - 6} y={tick.y + 3} textAnchor="end">
              {tick.label}
            </text>
          </g>
        ))}
        {curve.xTicks.map((tick) => (
          <text key={tick.label} className={styles.tick} x={tick.x} y={curve.plotBottom + 14} textAnchor="middle">
            {tick.label}
          </text>
        ))}
        <path className={styles.planned} d={curve.plannedPath} />
        <line className={styles.gap} x1={curve.point.x} x2={curve.point.x} y1={curve.point.plannedY} y2={curve.point.y} />
        <circle className={styles.plannedPoint} cx={curve.point.x} cy={curve.point.plannedY} r={3} />
        <circle className={styles.point} cx={curve.point.x} cy={curve.point.y} r={5} />
      </svg>
      <figcaption id="plan-curve-caption" className={styles.caption}>
        Conteúdo restante ao longo dos meses. A linha é o plano; o ponto é você hoje.
      </figcaption>
    </figure>
  );
}
