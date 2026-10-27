import { useState } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import type { AdminPerson } from '../../../../../domain/entities/people/admin-person.entity';
import { useAccountManagement } from '../../../../hooks/use-account-management/use-account-management';
import styles from './account-dialog.module.css';

interface AccountDialogProps {
  readonly person: AdminPerson;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function AccountDialog({ person, open, onClose }: AccountDialogProps) {
  const account = useAccountManagement(person, onClose);
  const [typed, setTyped] = useState('');
  const ownsCourses = person.coursesOwned > 0;

  return (
    <Dialog
      open={open}
      title={`Conta de ${person.displayName}`}
      description="Nenhuma destas ações mostra o progresso, as anotações ou o diário da pessoa."
      onClose={onClose}
      actions={
        <Button size="md" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className={styles.actions}>
        <div className={styles.action}>
          <div>
            <p className={styles.title}>Encerrar sessões</p>
            <p className={styles.text}>Desconecta de todos os aparelhos. A pessoa entra de novo com o GitHub.</p>
          </div>
          <Button disabled={account.isBusy} onClick={account.endSessions}>
            Encerrar
          </Button>
        </div>
        <div className={styles.action}>
          <div>
            <p className={styles.title}>{account.isBlocked ? 'Desbloquear' : 'Bloquear'}</p>
            <p className={styles.text}>
              {account.isBlocked
                ? 'A pessoa volta a entrar e a gravar.'
                : 'Impede o login e qualquer gravação, e encerra as sessões. O progresso continua guardado.'}
            </p>
          </div>
          <Button tone={account.isBlocked ? 'default' : 'danger'} disabled={account.isBusy} onClick={account.toggleBlocked}>
            {account.isBlocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
        </div>
        <div className={styles.danger}>
          <p className={styles.title}>Excluir conta</p>
          {ownsCourses ? (
            <p className={styles.text}>Antes de excluir, transfira os cursos desta pessoa em Cursos.</p>
          ) : (
            <>
              <p className={styles.text}>Apaga perfil, progresso, anotações, diário e propostas. Não dá para desfazer.</p>
              <TextField label={`Para excluir, digite ${person.handle}`} value={typed} autoComplete="off" spellCheck={false} onChange={(event) => setTyped(event.target.value)} />
              <div>
                <Button tone="danger-solid" disabled={typed.trim() !== person.handle || account.isBusy} onClick={account.remove}>
                  Excluir conta definitivamente
                </Button>
              </div>
            </>
          )}
        </div>
        {account.error ? <Notice tone="danger">{account.error}</Notice> : null}
      </div>
    </Dialog>
  );
}
