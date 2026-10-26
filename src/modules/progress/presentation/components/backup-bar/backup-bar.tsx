import type { ChangeEvent } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import type { useBackupActions } from '../../hooks/use-backup-actions/use-backup-actions';
import styles from './backup-bar.module.css';
import { ConfirmationRow } from './components/confirmation-row/confirmation-row';

interface BackupBarProps {
  backup: ReturnType<typeof useBackupActions>;
}

export function BackupBar({ backup }: BackupBarProps) {
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) backup.readFile(file);
  };

  return (
    <div className={styles.bar}>
      <p className={styles.text}>
        <strong>Salvo na sua conta.</strong> Progresso, anotações e diário aparecem em qualquer aparelho em que você entrar com o GitHub. O
        backup é uma cópia sua, em arquivo, para guardar ou levar a outra instância.
      </p>
      <div className={styles.actions}>
        <Button onClick={backup.exportJournal}>Exportar diário (.md)</Button>
        <Button onClick={backup.exportBackup}>Exportar backup</Button>
        <label className={styles.fileButton}>
          Importar backup
          <input className={styles.fileInput} type="file" accept=".json,application/json" onChange={onFileChange} />
        </label>
        <Button tone="danger" onClick={backup.requestErase}>
          Apagar meu progresso
        </Button>
      </div>
      {backup.pendingImport ? (
        <ConfirmationRow
          text={`Backup com ${backup.pendingImport.completedItems} itens concluídos, ${backup.pendingImport.studyDays} dias feitos e ${backup.pendingImport.journalEntries} anotações no diário. Isso substitui o progresso atual.`}
          confirmLabel="Substituir progresso"
          onConfirm={backup.confirmImport}
          onCancel={backup.cancelImport}
        />
      ) : null}
      {backup.eraseRequested ? (
        <ConfirmationRow
          text="Isso apaga da sua conta o progresso, as anotações e o diário deste curso. Não dá para desfazer."
          confirmLabel="Apagar definitivamente"
          onConfirm={() => void backup.confirmErase()}
          onCancel={backup.cancelErase}
        />
      ) : null}
      {backup.message ? (
        <p className={backup.message.tone === 'error' ? `${styles.message} ${styles.error}` : styles.message} role="status">
          {backup.message.text}
        </p>
      ) : null}
    </div>
  );
}
