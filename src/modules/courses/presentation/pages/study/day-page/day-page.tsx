import { Link, Navigate, useParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { Breadcrumb } from '@/shared/presentation/components/navigation/breadcrumb/breadcrumb';
import { Tabs } from '@/shared/presentation/components/navigation/tabs/tabs';
import { useDayPage } from '../../../hooks/use-day-page/use-day-page';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import styles from './day-page.module.css';

const TABS_ID = 'dia';

export function DayPage() {
  const { date = '' } = useParams();
  const context = useStudyContext();
  const page = useDayPage(context, date);

  if (!page.day) return <Navigate to={page.fallbackPath} replace />;

  return (
    <div className={styles.page}>
      <title>{`${page.title} · ${context.details.course.title}`}</title>
      <Breadcrumb items={page.breadcrumb} />
      <header className={styles.header}>
        <p className={styles.reference}>{page.reference}</p>
        <h1 className={styles.title}>{page.title}</h1>
      </header>

      <div className={styles.columns}>
        <div className={styles.main}>
          <Tabs label="Conteúdo do dia" items={page.tabs} selectedId={page.tab} idPrefix={TABS_ID} onSelect={page.setTab} />
          {page.tab === 'tarefa' ? (
            <section id={`${TABS_ID}-panel-tarefa`} role="tabpanel" aria-labelledby={`${TABS_ID}-tab-tarefa`} className={styles.panel}>
              <p className={styles.task}>{page.detail}</p>
              {page.lesson ? (
                <div className={styles.exercise}>
                  <p className={styles.label}>Exercício da aula</p>
                  <p>{page.lesson.exercise}</p>
                </div>
              ) : null}
            </section>
          ) : null}
          {page.tab === 'aula' && page.lesson ? (
            <section id={`${TABS_ID}-panel-aula`} role="tabpanel" aria-labelledby={`${TABS_ID}-tab-aula`} className={styles.panel}>
              <h2 className={styles.panelTitle}>{page.lesson.title}</h2>
              <p>{page.lesson.summary}</p>
            </section>
          ) : null}
          {page.tab === 'anotacoes' ? (
            <section id={`${TABS_ID}-panel-anotacoes`} role="tabpanel" aria-labelledby={`${TABS_ID}-tab-anotacoes`} className={styles.panel}>
              <TextAreaField
                label="O que você aprendeu"
                hint="Vai para o diário deste dia."
                rows={8}
                value={page.journalText}
                onChange={(event) => page.setJournal(event.target.value)}
              />
            </section>
          ) : null}
          <nav className={styles.days} aria-label="Outros dias">
            {page.previousPath ? <Link to={page.previousPath}>← Dia anterior</Link> : <span />}
            {page.nextPath ? <Link to={page.nextPath}>Próximo dia →</Link> : null}
          </nav>
        </div>

        <aside className={styles.side}>
          <div className={styles.card}>
            <p className={styles.label}>Sessão de estudo</p>
            <p className={styles.timer} role="timer" aria-live="off">
              {page.timer.label}
            </p>
            <div className={styles.timerActions}>
              <Button tone={page.timer.isRunning ? 'default' : 'primary'} disabled={page.timer.isFinished} onClick={page.timer.toggle}>
                {page.timer.isRunning ? 'Pausar' : 'Começar'}
              </Button>
              <Button tone="ghost" onClick={page.timer.reset}>
                Zerar
              </Button>
            </div>
            {page.timer.isFinished ? <p className={styles.done} role="status">Tempo da sessão concluído.</p> : null}
          </div>
          <div className={styles.card}>
            <p className={styles.label}>Fechar o dia</p>
            {page.item ? (
              <CheckboxField checked={page.item.isDone} onChange={(event) => page.setItemDone(event.target.checked)}>
                {page.item.label}
              </CheckboxField>
            ) : null}
            <CheckboxField checked={page.isDayDone} onChange={(event) => page.setDayDone(event.target.checked)}>
              Marcar o dia como feito
            </CheckboxField>
          </div>
        </aside>
      </div>
    </div>
  );
}
