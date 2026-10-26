import { ArrowRight, Check } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { ProgressMeter } from '@/shared/presentation/components/feedback/progress-meter/progress-meter';
import { ModuleContent } from '../../../components/module-content/module-content';
import { useModulePage } from '../../../hooks/use-module-page/use-module-page';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import hidden from '@/shared/presentation/styles/visually-hidden.module.css';
import styles from './module-page.module.css';

export function ModulePage() {
  const { moduleId = '' } = useParams();
  const context = useStudyContext();
  const page = useModulePage(context, moduleId);
  const { module } = page;

  if (!module) return <Navigate to={page.fallbackPath} replace />;

  return (
    <div className={styles.page}>
      <title>{`${module.title} · ${context.details.course.title}`}</title>
      <nav className={styles.chips} aria-label="Módulos do curso">
        {page.chips.map((chip) => (
          <Link key={chip.id} to={chip.to} className={chip.isActive ? `${styles.chip} ${styles.active}` : styles.chip} aria-current={chip.isActive ? 'page' : undefined} title={chip.title}>
            {chip.code}
            {chip.isComplete ? (
              <>
                <Check className={styles.check} size={16} aria-hidden="true" />
                <span className={hidden.visuallyHidden}> (concluído)</span>
              </>
            ) : null}
          </Link>
        ))}
      </nav>

      <header className={styles.header}>
        <p className={styles.kicker}>{page.kicker}</p>
        <h1 className={styles.title}>{module.title}</h1>
        <div className={styles.progress}>
          <ProgressMeter value={module.completed} max={module.total} label={`${module.completed} de ${module.total} itens do módulo`} />
          <span>
            {module.completed} de {module.total} itens
          </span>
        </div>
      </header>

      {page.projectPath ? (
        <Link className={styles.project} to={page.projectPath}>
          <span className={styles.projectLabel}>Projeto do módulo</span>
          <span className={styles.projectTitle}>{module.project.title}</span>
          <span className={styles.projectCta}>
            Ver requisitos e entregar
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
      ) : null}

      <ModuleContent module={module} onItemDoneChange={page.setItemCompleted} onNoteChange={page.setNote} />
    </div>
  );
}
