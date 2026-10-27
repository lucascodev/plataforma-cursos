import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import type { ProfileReportReason } from '../../../domain/types/profile-report-reason.type';
import { useReportTeacher } from '../../hooks/use-report-teacher/use-report-teacher';
import styles from './report-teacher.module.css';

const REASONS: readonly { readonly value: ProfileReportReason; readonly label: string }[] = [
  { value: 'false-info', label: 'Informação falsa' },
  { value: 'offensive', label: 'Conteúdo ofensivo' },
  { value: 'suspicious-link', label: 'Link suspeito' },
  { value: 'other', label: 'Outro' },
];

export function ReportTeacher({ handle }: { readonly handle: string }) {
  const report = useReportTeacher(handle);
  if (report.isOwnProfile) return null;

  return (
    <>
      <p className={styles.line}>
        Algo errado neste perfil?{' '}
        <button type="button" className={styles.link} onClick={report.open}>
          Avisar a equipe
        </button>
      </p>
      <Dialog
        open={report.isOpen}
        title="Avisar a equipe"
        description={
          report.needsSignIn
            ? 'Para avisar, entre com o GitHub. Isso evita avisos falsos em massa; o professor continua sem saber quem avisou.'
            : 'O professor não fica sabendo quem avisou.'
        }
        onClose={report.close}
        actions={
          <>
            <Button size="md" onClick={report.close}>
              Cancelar
            </Button>
            {report.needsSignIn ? (
              <Button size="md" tone="primary" onClick={report.signIn}>
                Entrar com o GitHub
              </Button>
            ) : (
              <Button size="md" tone="primary" disabled={report.isCheckingSession} isLoading={report.isSending} onClick={report.send}>
                Enviar aviso
              </Button>
            )}
          </>
        }
      >
        {report.needsSignIn ? null : (
          <div className={styles.fields}>
            <SelectField
              label="Motivo"
              value={report.reason}
              options={REASONS}
              onChange={(event) => report.setReason(event.target.value as ProfileReportReason)}
            />
            <TextAreaField
              label="Detalhes (opcional)"
              rows={3}
              maxLength={1000}
              value={report.details}
              onChange={(event) => report.setDetails(event.target.value)}
            />
            {report.error ? <Notice tone="danger">{report.error}</Notice> : null}
          </div>
        )}
      </Dialog>
    </>
  );
}
