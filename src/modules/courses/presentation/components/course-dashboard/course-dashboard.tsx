import { BackupBar, SaveStatus, useBackupActions, useCourseProgress } from '@/modules/progress';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { SectionHeading } from '@/shared/presentation/components/layout/section-heading/section-heading';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { useCourseDashboard } from '../../hooks/use-course-dashboard/use-course-dashboard';
import { useModulePanels } from '../../hooks/use-module-panels/use-module-panels';
import { CourseGuide } from '../course-guide/course-guide';
import { CourseHero } from '../course-hero/course-hero';
import { DailyPlan } from '../daily-plan/daily-plan';
import { ModulePanel } from '../module-panel/module-panel';
import { ProgressOverview } from '../progress-overview/progress-overview';
import { SyllabusStrip } from '../syllabus-strip/syllabus-strip';
import { StartDateField } from './components/start-date-field/start-date-field';
import styles from './course-dashboard.module.css';

interface CourseDashboardProps {
  details: CourseDetailsOutputDto;
}

export function CourseDashboard({ details }: CourseDashboardProps) {
  const { course } = details;
  const progressState = useCourseProgress(course.slug);
  const dashboard = useCourseDashboard(details, progressState);
  const panels = useModulePanels(dashboard?.currentModuleId ?? null);
  const backup = useBackupActions({
    courseSlug: course.slug,
    progress: progressState.progress,
    actions: progressState.actions,
    buildJournalExport: () => dashboard?.buildJournalExport() ?? null,
  });
  const { actions } = progressState;

  if (progressState.status === 'error') {
    return (
      <PageStatus title="Não foi possível carregar seu progresso">
        <p>Verifique a conexão e tente de novo. Nada do que você já salvou foi perdido.</p>
        <Button tone="primary" onClick={actions.retryLoading}>
          Tentar de novo
        </Button>
      </PageStatus>
    );
  }

  if (!dashboard) return <PageStatus title="Carregando seu progresso…" />;

  return (
    <div className={styles.dashboard}>
      <title>{course.title}</title>
      <CourseHero
        title={course.title}
        tagline={course.tagline}
        description={course.description}
        facts={dashboard.facts}
        author={course.author}
      >
        <StartDateField value={dashboard.startDate} onChange={dashboard.changeStartDate} />
        <SaveStatus saveState={progressState.saveState} />
      </CourseHero>

      <section className={styles.section} aria-labelledby="secao-progresso">
        <SectionHeading id="secao-progresso" title="Seu progresso" />
        <ProgressOverview overview={dashboard.overview} />
      </section>

      <section className={styles.section} aria-labelledby="secao-plano">
        <SectionHeading id="secao-plano" title="Plano de estudo" aside={dashboard.planMeta} />
        <DailyPlan
          today={dashboard.todayView}
          week={dashboard.week}
          stats={dashboard.stats}
          onDayDoneChange={actions.setStudyDayDone}
          onItemDoneChange={actions.setItemCompleted}
          onJournalChange={actions.setJournalEntry}
        />
      </section>

      <section className={styles.section} aria-labelledby="secao-trilha">
        <SectionHeading id="secao-trilha" title="Trilha" />
        <SyllabusStrip modules={dashboard.modules} onSelect={panels.openAndReveal} />
      </section>

      <section className={styles.section} aria-labelledby="secao-modulos">
        <SectionHeading id="secao-modulos" title="Módulos" />
        <div className={styles.modules}>
          {dashboard.modules.map((module) => (
            <ModulePanel
              key={module.id}
              module={module}
              isOpen={panels.isOpen(module.id)}
              onToggle={() => panels.toggle(module.id)}
              onItemDoneChange={actions.setItemCompleted}
              onNoteChange={(text) => actions.setModuleNote(module.id, text)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="secao-guia">
        <SectionHeading id="secao-guia" title="Guia do curso" />
        <CourseGuide guide={dashboard.guide} rhythm={dashboard.rhythm} />
      </section>

      <section className={styles.section} aria-labelledby="secao-dados">
        <SectionHeading id="secao-dados" title="Seus dados" />
        <BackupBar backup={backup} />
      </section>
    </div>
  );
}
