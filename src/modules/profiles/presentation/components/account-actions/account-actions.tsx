import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { TypedConfirmDialog } from '@/shared/presentation/components/overlay/typed-confirm-dialog/typed-confirm-dialog';
import { useAccountActions } from '../../hooks/use-account-actions/use-account-actions';
import styles from './account-actions.module.css';

const DELETE_PHRASE = 'EXCLUIR';

export function AccountActions() {
  const actions = useAccountActions();

  return (
    <>
      <section className={styles.section} aria-labelledby="conta-sessoes">
        <h2 id="conta-sessoes" className={styles.title}>
          Login e sessões
        </h2>
        <p className={styles.text}>Você entra com o GitHub. A plataforma não guarda senha.</p>
        <div>
          <Button onClick={actions.askSignOutEverywhere}>Sair de todos os aparelhos</Button>
        </div>
      </section>

      <section className={`${styles.section} ${styles.danger}`} aria-labelledby="conta-excluir">
        <h2 id="conta-excluir" className={styles.title}>
          Excluir conta
        </h2>
        <p className={styles.text}>
          Apaga seu perfil, o progresso de todos os cursos, anotações, diário e propostas. Não dá para desfazer. Antes, se quiser guardar, baixe o
          backup na seção "Seus dados" de cada curso.
        </p>
        {actions.isTeacher ? (
          <p className={styles.text}>
            Se você tem um curso na plataforma, peça à equipe para transferi-lo antes, para que quem estuda não perca o acesso. Veja em{' '}
            <Link to="/professor">Área do professor</Link>.
          </p>
        ) : null}
        {actions.deleteError ? <Notice tone="danger">{actions.deleteError}</Notice> : null}
        <div>
          <Button tone="danger" onClick={actions.askDelete}>
            Excluir minha conta
          </Button>
        </div>
      </section>

      <Dialog
        open={actions.confirming === 'sessions'}
        role="alertdialog"
        title="Sair de todos os aparelhos?"
        description="Celular, computador do trabalho, qualquer navegador onde você entrou, inclusive este. Seu progresso continua salvo."
        onClose={actions.cancel}
        actions={
          <>
            <Button size="md" onClick={actions.cancel}>
              Cancelar
            </Button>
            <Button size="md" tone="strong" isLoading={actions.isBusy} onClick={() => void actions.signOutEverywhere()}>
              Sair de todos
            </Button>
          </>
        }
      />
      <TypedConfirmDialog
        open={actions.confirming === 'delete'}
        title="Excluir sua conta?"
        description="Perfil, progresso, anotações e diário de todos os cursos serão apagados."
        phrase={DELETE_PHRASE}
        confirmLabel="Excluir definitivamente"
        isLoading={actions.isBusy}
        onConfirm={() => void actions.deleteAccount()}
        onClose={actions.cancel}
      />
    </>
  );
}
