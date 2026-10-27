import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useCourseWorkspaceQuery } from '../../hooks/use-course-workspace-query/use-course-workspace-query';
import { useOpenDraftMutation } from '../../hooks/use-open-draft-mutation/use-open-draft-mutation';
import { CourseEditorView } from '../course-editor-view/course-editor-view';

export function CourseEditorLoader({ slug }: { readonly slug: string }) {
  const workspace = useCourseWorkspaceQuery(slug);
  const openDraft = useOpenDraftMutation(slug);

  if (workspace.isPending) return <PageStatus title="Carregando o curso…" />;
  if (workspace.isError) {
    return (
      <PageStatus title="Não foi possível abrir o curso">
        <p>{readErrorMessage(workspace.error, 'Tente de novo em instantes.')}</p>
        <Button onClick={() => void workspace.refetch()}>Tentar de novo</Button>
      </PageStatus>
    );
  }
  if (!workspace.data) {
    return (
      <PageStatus title="Curso não encontrado">
        <p>Só a pessoa responsável pelo curso pode editá-lo.</p>
        <Link to="/professor">Voltar para meus cursos</Link>
      </PageStatus>
    );
  }
  const { openVersion } = workspace.data;
  if (!openVersion) {
    return (
      <PageStatus title="Começar uma nova versão">
        <p>
          O que está publicado continua no ar enquanto você escreve. A nova versão parte da v{workspace.data.publishedVersion?.semver} e só entra
          no ar depois da revisão.
        </p>
        {openDraft.isError ? <Notice tone="danger">{readErrorMessage(openDraft.error, 'Não foi possível abrir o rascunho agora.')}</Notice> : null}
        <Button tone="primary" size="md" isLoading={openDraft.isPending} onClick={() => openDraft.mutate()}>
          Abrir rascunho
        </Button>
      </PageStatus>
    );
  }
  return <CourseEditorView key={openVersion.id} slug={slug} workspace={workspace.data} version={openVersion} />;
}
