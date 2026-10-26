import { Link } from 'react-router';
import { StatTile } from '@/shared/presentation/components/data/stat-tile/stat-tile';
import { ProgressMeter } from '@/shared/presentation/components/feedback/progress-meter/progress-meter';
import { TodayCard } from '../../../components/daily-plan/components/today-card/today-card';
import { WeekCalendar } from '../../../components/daily-plan/components/week-calendar/week-calendar';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import { useTodayPage } from '../../../hooks/use-today-page/use-today-page';
import styles from './today-page.module.css';

export function TodayPage() {
  const context = useStudyContext();
  const page = useTodayPage(context);
  const { study, progressState, details } = context;
  const { actions } = progressState;

  return (
    <div className={styles.page}>
      <title>{`Hoje · ${details.course.title}`}</title>
      <header className={styles.header}>
        <div>
          <p className={styles.date}>{page.dateLine}</p>
          <h1 className={styles.title}>{page.heading}</h1>
        </div>
        <span className={page.pace.isBehind ? `${styles.pace} ${styles.behind}` : styles.pace}>{page.pace.text}</span>
      </header>

      <div className={styles.top}>
        {study.todayView ? (
          <TodayCard today={study.todayView} onDayDoneChange={actions.setStudyDayDone} onItemDoneChange={actions.setItemCompleted} onJournalChange={actions.setJournalEntry} />
        ) : null}
        <dl className={styles.stats}>
          {page.stats.map((stat) => (
            <StatTile key={stat.label} label={stat.label} value={stat.value} hint={stat.link ? <Link to={stat.link}>{stat.hint}</Link> : stat.hint} />
          ))}
        </dl>
      </div>

      <section className={styles.section} aria-labelledby="semana-titulo">
        <h2 id="semana-titulo" className={styles.sectionTitle}>
          Esta semana
        </h2>
        <WeekCalendar week={study.weekView} onDayDoneChange={actions.setStudyDayDone} onItemDoneChange={actions.setItemCompleted} onJournalChange={actions.setJournalEntry} />
      </section>

      <section className={styles.section} aria-labelledby="modulos-titulo">
        <h2 id="modulos-titulo" className={styles.sectionTitle}>
          Módulos
        </h2>
        <ul className={styles.modules}>
          {page.moduleCards.map((module) => (
            <li key={module.id}>
              <Link className={module.isCurrent ? `${styles.module} ${styles.current}` : styles.module} to={module.to}>
                <span className={styles.moduleHead}>
                  <span className={styles.code}>{module.code}</span>
                  <span className={styles.count}>
                    {module.completed} de {module.total}
                  </span>
                </span>
                <span className={styles.moduleTitle}>{module.title}</span>
                <ProgressMeter value={module.completed} max={module.total} label={`${module.title}: ${module.completed} de ${module.total} itens`} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
