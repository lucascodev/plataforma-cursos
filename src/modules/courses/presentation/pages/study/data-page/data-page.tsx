import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { TypedConfirmDialog } from '@/shared/presentation/components/overlay/typed-confirm-dialog/typed-confirm-dialog';
import { ERASE_CONFIRMATION_PHRASE } from '../../../constants/erase-confirmation-phrase';
import { useDataPage } from '../../../hooks/use-data-page/use-data-page';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import styles from './data-page.module.css';

export function DataPage() {
  const context = useStudyContext();
  const page = useDataPage(context);

  return (
    <div className={styles.page}>
      <title>{`Seus dados · ${context.details.course.title}`}</title>
      <header>
        <h1 className={styles.title}>Seus dados e conta</h1>
        <p className={styles.lead}>Neste curso: {page.summary}.</p>
      </header>

      {page.user ? (
        <section className={styles.account} aria-label="Sua conta">
          {page.user.avatarUrl ? <img src={page.user.avatarUrl} alt="" width={56} height={56} referrerPolicy="no-referrer" /> : null}
          <div className={styles.accountText}>
            <p className={styles.accountName}>{page.user.displayName}</p>
            <p className={styles.muted}>Conectado com o GitHub · progresso salvo na conta</p>
          </div>
          <Button onClick={page.signOut.ask}>Sair</Button>
        </section>
      ) : null}

      {page.message ? (
        <Banner tone={page.message.tone === 'error' ? 'danger' : 'accent'}>
          <p>{page.message.text}</p>
        </Banner>
      ) : null}

      <section className={styles.section} aria-labelledby="levar-dados">
        <h2 id="levar-dados" className={styles.sectionTitle}>
          Levar seus dados
        </h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Exportar backup</p>
            <p className={styles.muted}>Arquivo .json com tudo deste curso: itens, dias, anotações e diário.</p>
            <Button onClick={page.exportBackup}>Exportar backup</Button>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Exportar diário</p>
            <p className={styles.muted}>Arquivo .md para ler em qualquer editor de texto.</p>
            <Button onClick={page.exportJournal}>Exportar diário</Button>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Importar backup</p>
            <p className={styles.muted}>Um backup .json exportado por esta página, de até 2 MB.</p>
            <label className={styles.fileButton}>
              Escolher arquivo
              <input className={styles.fileInput} type="file" accept=".json,application/json" onChange={page.onFileChange} />
            </label>
          </div>
        </div>
      </section>

      <section className={styles.danger} aria-labelledby="apagar">
        <div>
          <h2 id="apagar" className={styles.sectionTitle}>
            Apagar meu progresso neste curso
          </h2>
          <p className={styles.muted}>
            Apaga da sua conta os itens concluídos, os dias, as anotações e o diário deste curso. Para excluir a conta inteira, veja a{' '}
            <Link to="/privacidade#direitos">política de privacidade</Link>.
          </p>
        </div>
        <Button tone="danger" onClick={page.requestErase}>
          Apagar meu progresso
        </Button>
      </section>

      <Dialog
        open={page.importPreview !== null}
        title="Substituir pelo backup?"
        description={<p>Backup exportado em {page.importPreview?.exportedOn}. O progresso atual deste curso é trocado pelo do arquivo.</p>}
        onClose={page.cancelImport}
        actions={
          <>
            <Button size="md" onClick={page.cancelImport}>
              Cancelar
            </Button>
            <Button size="md" tone="primary" onClick={page.confirmImport}>
              Substituir progresso
            </Button>
          </>
        }
      >
        <table className={styles.compare}>
          <thead>
            <tr>
              <th scope="col">Dado</th>
              <th scope="col">No backup</th>
              <th scope="col">Agora</th>
            </tr>
          </thead>
          <tbody>
            {page.importPreview?.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.backup}</td>
                <td>{row.current}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Dialog>

      <TypedConfirmDialog
        open={page.isConfirmingErase}
        title="Apagar o progresso deste curso?"
        description={<p>Isso não pode ser desfeito. Se quiser guardar uma cópia, exporte o backup antes.</p>}
        phrase={ERASE_CONFIRMATION_PHRASE}
        confirmLabel="Apagar definitivamente"
        onConfirm={page.confirmErase}
        onClose={page.cancelErase}
      />

      <Dialog
        open={page.signOut.isConfirming}
        title="Sair da conta?"
        description={<p>Seu progresso continua salvo na conta. Para voltar, é só entrar com o GitHub de novo.</p>}
        onClose={page.signOut.cancel}
        actions={
          <>
            <Button size="md" onClick={page.signOut.cancel}>
              Ficar
            </Button>
            <Button size="md" tone="strong" onClick={page.signOut.confirm}>
              Sair
            </Button>
          </>
        }
      />
    </div>
  );
}
