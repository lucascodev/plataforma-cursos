import { ArrowLeft, ExternalLink, Send, Undo2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import type { VersionStatus } from '../../../domain/types/version-status.type';
import { describeVersionStatus } from '../../formatters/describe-version-status';
import type { SaveStatus } from '../../types/save-status.type';
import { SaveStatusLabel } from '../save-status-label/save-status-label';
import styles from './editor-header.module.css';

interface EditorHeaderProps {
  readonly title: string;
  readonly slug: string;
  readonly status: VersionStatus;
  readonly versionLabel: string;
  readonly saveStatus: SaveStatus;
  readonly isPublished: boolean;
  readonly canSubmit: boolean;
  readonly isWithdrawing: boolean;
  readonly onSubmit: () => void;
  readonly onWithdraw: () => void;
}

export function EditorHeader(props: EditorHeaderProps) {
  const { title, slug, status, versionLabel, saveStatus, isPublished, canSubmit, isWithdrawing, onSubmit, onWithdraw } = props;
  const badge = describeVersionStatus(status);
  return (
    <header className={styles.header}>
      <Link className={styles.back} to="/professor">
        <ArrowLeft size={16} aria-hidden="true" />
        Meus cursos
      </Link>
      <div className={styles.bar}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{title || 'Curso sem título'}</h1>
          <p className={styles.meta}>
            <Badge tone={badge.tone}>{badge.label}</Badge>
            <span>{versionLabel}</span>
            {status === 'in_review' ? null : <SaveStatusLabel status={saveStatus} />}
          </p>
        </div>
        <div className={styles.actions}>
          {isPublished ? (
            <Link className={styles.link} to={`/cursos/${slug}`} target="_blank" rel="noopener">
              <ExternalLink size={16} aria-hidden="true" />
              Ver no site
            </Link>
          ) : null}
          {status === 'in_review' ? (
            <Button size="md" isLoading={isWithdrawing} onClick={onWithdraw}>
              <Undo2 size={16} aria-hidden="true" />
              Retirar da revisão
            </Button>
          ) : (
            <Button size="md" tone="primary" disabled={!canSubmit} onClick={onSubmit}>
              <Send size={16} aria-hidden="true" />
              Enviar para revisão
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
