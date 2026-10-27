import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { Tabs } from '@/shared/presentation/components/navigation/tabs/tabs';
import type { CourseWorkspace } from '../../../domain/entities/course-workspace.entity';
import type { OpenVersion } from '../../../domain/entities/versions/open-version.entity';
import a11y from '@/shared/presentation/styles/visually-hidden.module.css';
import { describeVersionLabel } from '../../formatters/describe-version-label';
import { useCourseEditorView } from '../../hooks/use-course-editor-view/use-course-editor-view';
import editorStyles from '../../styles/editor.module.css';
import type { EditorTab } from '../../types/editor-tab.type';
import { ChangesPanel } from '../changes-panel/changes-panel';
import { ChecksPanel } from '../checks-panel/checks-panel';
import { EditorHeader } from '../editor-header/editor-header';
import { GuideTab } from '../guide-tab/guide-tab';
import { InfoTab } from '../info-tab/info-tab';
import { ModulesTab } from '../modules-tab/modules-tab';
import { ReviewItemsPanel } from '../review-items-panel/review-items-panel';
import { RhythmTab } from '../rhythm-tab/rhythm-tab';
import { SubmitVersionDialog } from '../submit-version-dialog/submit-version-dialog';
import styles from './course-editor-view.module.css';

const TABS: readonly { readonly id: EditorTab; readonly label: string }[] = [
  { id: 'info', label: 'Informações' },
  { id: 'modules', label: 'Módulos e aulas' },
  { id: 'guide', label: 'Guia' },
  { id: 'rhythm', label: 'Ritmo e plano' },
];

interface CourseEditorViewProps {
  readonly slug: string;
  readonly workspace: CourseWorkspace;
  readonly version: OpenVersion;
}

export function CourseEditorView({ slug, workspace, version }: CourseEditorViewProps) {
  const view = useCourseEditorView(slug, workspace, version);
  const { editor } = view;
  const publishedSemver = workspace.publishedVersion?.semver ?? null;

  return (
    <div className={styles.page}>
      <EditorHeader
        title={editor.course.title}
        slug={slug}
        status={version.status}
        versionLabel={describeVersionLabel(version, publishedSemver)}
        saveStatus={editor.saveStatus}
        isPublished={workspace.course.published}
        canSubmit={view.canSubmit}
        isWithdrawing={view.isWithdrawing}
        onSubmit={view.openSubmit}
        onWithdraw={view.withdrawFromReview}
      />

      {version.status === 'in_review' ? (
        <Banner tone="info" title="Versão em revisão">
          {publishedSemver ? `A versão ${publishedSemver} continua no ar. ` : ''}Para editar de novo, retire a versão da revisão.
        </Banner>
      ) : null}
      {editor.saveStatus === 'conflict' ? (
        <Banner tone="danger" title="Rascunho alterado em outra aba" action={<Button onClick={() => window.location.reload()}>Recarregar</Button>}>
          Outra aba ou aparelho salvou este rascunho depois de você. Recarregue para continuar de onde ele está; o que você digitou aqui desde o último salvamento não foi salvo.
        </Banner>
      ) : null}
      {editor.saveStatus === 'error' ? (
        <Banner tone="warning" title="Não foi possível salvar" action={<Button onClick={() => void editor.flush()}>Tentar de novo</Button>}>
          Suas alterações continuam nesta aba. Confira a conexão.
        </Banner>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.main}>
          <Tabs label="Partes do curso" idPrefix="editor" items={TABS} selectedId={view.tab} onSelect={(id) => view.setTab(id as EditorTab)} />
          <fieldset className={editorStyles.locked} disabled={!editor.isEditable}>
            <legend className={a11y.visuallyHidden}>{TABS.find((tab) => tab.id === view.tab)?.label}</legend>
            <div role="tabpanel" id={`editor-panel-${view.tab}`} aria-labelledby={`editor-tab-${view.tab}`} className={styles.panel}>
              {view.tab === 'info' ? <InfoTab course={editor.course} update={editor.update} /> : null}
              {view.tab === 'modules' ? <ModulesTab course={editor.course} publishedContent={workspace.publishedContent} update={editor.update} /> : null}
              {view.tab === 'guide' ? <GuideTab course={editor.course} update={editor.update} /> : null}
              {view.tab === 'rhythm' ? <RhythmTab course={editor.course} update={editor.update} /> : null}
            </div>
          </fieldset>
        </div>
        <aside className={styles.aside} aria-label="Revisão do curso">
          {version.status === 'changes_requested' ? (
            <ReviewItemsPanel items={view.reviewItems} reviewedAt={version.reviewedAt} isBusy={view.isResolving} onToggle={view.toggleReviewItem} />
          ) : null}
          <ChecksPanel checks={editor.checks} />
          <ChangesPanel diff={editor.diff} isFirstVersion={workspace.publishedVersion === null} />
        </aside>
      </div>

      <SubmitVersionDialog
        open={view.isSubmitOpen}
        publishedSemver={publishedSemver}
        isSubmitting={view.isSubmitting}
        error={view.submitError}
        onSubmit={(kind, message) => void view.sendForReview(kind, message)}
        onClose={view.closeSubmit}
      />
    </div>
  );
}
