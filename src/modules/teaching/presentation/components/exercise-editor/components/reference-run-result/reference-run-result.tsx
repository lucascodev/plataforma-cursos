import { CircleAlert, CircleCheck } from 'lucide-react';
import type { CodeRunResult } from '@/shared/application/ports/code-runner/code-run-result.type';
import styles from '../../../../styles/editor.module.css';

interface ReferenceRunResultProps {
  readonly result: CodeRunResult;
  readonly titles?: Readonly<Record<string, string>>;
}

export function ReferenceRunResult({ result, titles = {} }: ReferenceRunResultProps) {
  const passed = result.results.filter((item) => item.passed).length;
  return (
    <div className={styles.fields} role="status" aria-live="polite">
      {result.error ? <p className={styles.failed}>{result.error}</p> : null}
      {result.results.length > 0 ? (
        <p className={styles.itemLabel}>
          {passed} de {result.results.length} passaram
        </p>
      ) : null}
      <ul className={styles.list}>
        {result.results.map((item) => (
          <li key={item.id} className={item.passed ? styles.passed : styles.failed}>
            {item.passed ? <CircleCheck size={16} aria-hidden="true" /> : <CircleAlert size={16} aria-hidden="true" />}{' '}
            <strong>{titles[item.id] ?? item.id}</strong>
            {item.message ? `: ${item.message}` : ''}
          </li>
        ))}
      </ul>
      {result.output ? <pre className={styles.output}>{result.output}</pre> : null}
    </div>
  );
}
