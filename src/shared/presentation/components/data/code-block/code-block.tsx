import { useEffect, useRef, useState } from 'react';
import { Button } from '../../actions/button/button';
import styles from './code-block.module.css';

const COPIED_FEEDBACK_MS = 2000;

interface CodeBlockProps {
  readonly code: string;
  readonly label?: string;
}

export function CodeBlock({ code, label = 'Código' }: CodeBlockProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState('idle'), COPIED_FEEDBACK_MS);
  };

  return (
    <figure className={styles.block}>
      <pre className={styles.code} aria-label={label} tabIndex={0}>
        <code>{code}</code>
      </pre>
      <figcaption className={styles.footer}>
        <Button onClick={() => void copy()}>{copyState === 'copied' ? 'Copiado' : 'Copiar código'}</Button>
        <span className={styles.status} role="status">
          {copyState === 'failed' ? 'Não deu para copiar. Selecione o texto e copie com o teclado.' : ''}
        </span>
      </figcaption>
    </figure>
  );
}
