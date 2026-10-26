import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { EmptyState } from '@/shared/presentation/components/feedback/empty-state/empty-state';
import { useJournalPage } from '../../../hooks/use-journal-page/use-journal-page';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import styles from './journal-page.module.css';

export function JournalPage() {
  const context = useStudyContext();
  const page = useJournalPage(context);

  return (
    <div className={styles.page}>
      <title>{`Diário · ${context.details.course.title}`}</title>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Diário de estudo</h1>
          <p className={styles.lead}>O que você escreveu em cada dia, do mais novo para o mais antigo.</p>
        </div>
        <Button disabled={!page.hasEntries} onClick={page.exportMarkdown}>
          Exportar em Markdown
        </Button>
      </header>

      {page.hasEntries ? (
        <>
          <div className={styles.filters}>
            <label className={styles.search}>
              Buscar no diário
              <input type="search" value={page.query} placeholder="Ex.: pgvector, travei" onChange={(event) => page.setQuery(event.target.value)} />
            </label>
            <div className={styles.chips} role="group" aria-label="Filtrar por módulo">
              {page.filters.map((filter) => (
                <button key={filter.label} type="button" aria-pressed={filter.isActive} onClick={() => page.selectModule(filter.key)}>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {page.entries.length > 0 ? (
            <ol className={styles.entries}>
              {page.entries.map((entry) => (
                <li key={entry.date} className={styles.entry}>
                  <div className={styles.date}>
                    <span className={styles.day}>{entry.day}</span>
                    <span className={styles.meta}>{entry.meta}</span>
                  </div>
                  <div className={styles.body}>
                    <p className={styles.label}>{entry.label}</p>
                    <p className={styles.text}>{entry.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="Nada encontrado no diário" action={<Button onClick={page.clear}>Limpar filtros</Button>}>
              <p>Tente outra palavra ou mostre todos os módulos.</p>
            </EmptyState>
          )}
        </>
      ) : (
        <EmptyState title="Seu diário ainda está vazio" action={<Link to={page.todayPath}>Escrever o diário de hoje</Link>}>
          <p>Ao fim de cada dia, anote o que estudou, o que travou e o que ficou para amanhã. Isso ajuda a retomar depois.</p>
        </EmptyState>
      )}
    </div>
  );
}
