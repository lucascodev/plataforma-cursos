import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import { usePlanPage } from '../../../hooks/use-plan-page/use-plan-page';
import { MonthCalendar } from './components/month-calendar/month-calendar';
import styles from './plan-page.module.css';

export function PlanPage() {
  const context = useStudyContext();
  const page = usePlanPage(context);
  const { restart, selected } = page;

  return (
    <div className={styles.page}>
      <title>{`Plano · ${context.details.course.title}`}</title>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Plano de estudo</h1>
          <p className={styles.summary}>{page.summary}</p>
        </div>
        <div className={styles.toggle} role="group" aria-label="Visualização">
          <button type="button" aria-pressed={page.view === 'month'} onClick={() => page.setView('month')}>
            Mês
          </button>
          <button type="button" aria-pressed={page.view === 'list'} onClick={() => page.setView('list')}>
            Lista
          </button>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Button aria-label="Mês anterior" disabled={!page.canGoBack} onClick={page.previousMonth}>
          ‹
        </Button>
        <h2 className={styles.month} aria-live="polite">
          {page.monthTitle}
        </h2>
        <Button aria-label="Próximo mês" disabled={!page.canGoForward} onClick={page.nextMonth}>
          ›
        </Button>
        <Button tone="ghost" onClick={page.goToToday}>
          Hoje
        </Button>
        <ul className={styles.legend} aria-label="Legenda">
          <li className={styles.done}>Feito</li>
          <li className={styles.today}>Hoje</li>
          <li className={styles.late}>Em atraso</li>
          <li className={styles.upcoming}>A fazer</li>
        </ul>
      </div>

      <div className={styles.body}>
        {page.view === 'month' ? (
          <MonthCalendar weekdayLabels={page.weekdayLabels} weeks={page.weeks} onSelect={page.select} />
        ) : (
          <ol className={styles.list}>
            {page.monthDays.map((day) => (
              <li key={day.date}>
                <button type="button" className={styles.listItem} aria-pressed={selected?.date === day.date} onClick={() => page.select(day.date)}>
                  <span className={`${styles.dot} ${styles[day.status]}`} aria-hidden="true" />
                  <span className={styles.listDate}>{day.day}</span>
                  <span className={styles.listText}>
                    <span>{day.title}</span>
                    <span className={styles.muted}>
                      {day.reference} · {day.hours} · {day.statusLabel}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}

        {selected ? (
          <aside className={styles.panel} aria-label="Dia escolhido">
            <p className={styles.panelDate}>{selected.label}</p>
            <p className={styles.panelTitle}>{selected.title}</p>
            <p className={styles.muted}>
              {selected.reference} · {selected.hours}
            </p>
            <span className={`${styles.badge} ${styles[selected.status]}`}>{selected.statusLabel}</span>
            {selected.status === 'late' ? (
              <Banner tone="warning">
                <p>Esse dia ficou para trás. O plano não muda: é só retomar de onde parou.</p>
              </Banner>
            ) : null}
            <Link className={styles.open} to={selected.dayPath}>
              Abrir o dia
            </Link>
          </aside>
        ) : null}
      </div>

      <section className={styles.restart} aria-labelledby="recomecar-titulo">
        <div>
          <h2 id="recomecar-titulo" className={styles.restartTitle}>
            Recomeçar de outra data
          </h2>
          <p className={styles.muted}>O plano é refeito a partir da nova data. Itens concluídos, anotações e diário continuam.</p>
        </div>
        <label className={styles.dateField}>
          Nova data de início
          <input type="date" value={restart.date} onChange={(event) => restart.setDate(event.target.value)} />
        </label>
        <Button onClick={restart.ask}>Refazer o plano</Button>
      </section>

      <Dialog
        open={restart.isConfirming}
        title="Refazer o plano?"
        description={
          <p>
            Hoje o plano termina em {restart.currentEnd}. Começando de novo, termina em {restart.newEnd}. Itens concluídos, anotações e diário continuam.
          </p>
        }
        onClose={restart.cancel}
        actions={
          <>
            <Button size="md" onClick={restart.cancel}>
              Cancelar
            </Button>
            <Button size="md" tone="primary" onClick={restart.confirm}>
              Refazer o plano
            </Button>
          </>
        }
      />
    </div>
  );
}
