import type { CourseCheck } from '@contracts/course/checks/course-check.type';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import a11y from '@/shared/presentation/styles/visually-hidden.module.css';
import styles from './checks-panel.module.css';

const MAX_LISTED = 12;

export function ChecksPanel({ checks }: { readonly checks: readonly CourseCheck[] }) {
  const errors = checks.filter((check) => check.severity === 'error');
  const warnings = checks.filter((check) => check.severity === 'warning');
  const listed = [...errors, ...warnings].slice(0, MAX_LISTED);
  const hidden = errors.length + warnings.length - listed.length;

  return (
    <section className={styles.panel} aria-labelledby="checagem">
      <h2 id="checagem" className={styles.title}>
        Checagem automática
      </h2>
      {checks.length === 0 ? (
        <p className={styles.ok}>
          <CircleCheck size={18} aria-hidden="true" />
          Tudo certo para enviar.
        </p>
      ) : (
        <p className={styles.summary}>
          {errors.length} {errors.length === 1 ? 'erro' : 'erros'} · {warnings.length} {warnings.length === 1 ? 'aviso' : 'avisos'}
        </p>
      )}
      <ul className={styles.list}>
        {listed.map((check, index) => (
          <li key={`${check.where}-${index}`} className={check.severity === 'error' ? styles.error : styles.warning}>
            {check.severity === 'error' ? <CircleAlert size={16} aria-hidden="true" /> : <Info size={16} aria-hidden="true" />}
            <span>
              <span className={a11y.visuallyHidden}>{check.severity === 'error' ? 'Erro: ' : 'Aviso: '}</span>
              <strong>{check.where}</strong>: {check.message}
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 ? <p className={styles.note}>E mais {hidden}.</p> : null}
      <p className={styles.note}>Erros impedem o envio. Avisos não.</p>
    </section>
  );
}
