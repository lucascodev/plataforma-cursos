import { Link, Navigate, Outlet } from 'react-router';
import { SaveStatus } from '@/modules/progress';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { ProgressMeter } from '@/shared/presentation/components/feedback/progress-meter/progress-meter';
import { BottomTabBar } from '@/shared/presentation/components/navigation/bottom-tab-bar/bottom-tab-bar';
import { Sidebar } from '@/shared/presentation/components/navigation/sidebar/sidebar';
import type { CourseDetailsOutputDto } from '../../../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { useStudyShell } from '../../../../hooks/use-study-shell/use-study-shell';
import type { StudyContext } from '../../../../types/study/study-context.type';
import { StudyNavIcon } from '../../../../components/study-nav-icon/study-nav-icon';
import styles from './study-shell.module.css';

export function StudyShell({ details }: { readonly details: CourseDetailsOutputDto }) {
  const shell = useStudyShell(details);
  const { course } = details;

  if (shell.progressState.status === 'error') {
    return (
      <PageStatus title="Não foi possível carregar seu progresso">
        <p>Verifique a conexão e tente de novo. Nada do que você já salvou foi perdido.</p>
        <Button tone="primary" onClick={shell.progressState.actions.retryLoading}>
          Tentar de novo
        </Button>
      </PageStatus>
    );
  }
  if (shell.needsStart) return <Navigate to={shell.startPath} replace />;
  if (!shell.study) return <PageStatus title="Carregando seu progresso…" />;

  const toNavItem = (link: (typeof shell.navLinks)[number]) => ({ to: link.to, label: link.label, icon: <StudyNavIcon name={link.icon} /> });
  const items = shell.navLinks.map(toNavItem);
  const mobileItems = shell.navLinks.filter((link) => link.showOnMobile).map(toNavItem);
  const context: StudyContext = { details, progressState: shell.progressState, study: shell.study };
  const { completion } = shell.study;

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <Sidebar
          label="Curso"
          items={items}
          header={
            <div className={styles.course}>
              <span className={styles.courseLabel}>Curso</span>
              <Link to={`/cursos/${course.slug}`}>{course.title}</Link>
            </div>
          }
          footer={
            <div className={styles.progress}>
              <div className={styles.progressHeading}>
                <span>Progresso do curso</span>
                <strong>{completion.percent}%</strong>
              </div>
              <ProgressMeter value={completion.completed} max={completion.total} label={`${completion.completed} de ${completion.total} itens concluídos`} />
              <span className={styles.progressCount}>
                {completion.completed} de {completion.total} itens
              </span>
            </div>
          }
        />
      </aside>
      <div className={styles.content}>
        <div className={styles.status}>
          <SaveStatus saveState={shell.progressState.saveState} />
        </div>
        <Outlet context={context} />
      </div>
      <BottomTabBar label="Navegação do curso" items={mobileItems} />
    </div>
  );
}
