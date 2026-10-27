import { runCourseChecks } from '@contracts/course/checks/run-course-checks';
import { diffCourseVersions } from '@contracts/version/diff/diff-course-versions';
import { useState } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import type { AdminVersionDetail } from '../../../domain/entities/versions/admin-version-detail.entity';
import { parseReviewItems } from '../../../domain/rules/versions/parse-review-items.rule';
import { usePublishVersionMutation } from '../use-publish-version-mutation/use-publish-version-mutation';
import { useRequestVersionChangesMutation } from '../use-request-version-changes-mutation/use-request-version-changes-mutation';
import { useRestoreVersionMutation } from '../use-restore-version-mutation/use-restore-version-mutation';

export function useVersionReview(detail: AdminVersionDetail) {
  const { version } = detail;
  const toast = useToast();
  const publish = usePublishVersionMutation();
  const requestChanges = useRequestVersionChangesMutation();
  const restore = useRestoreVersionMutation();
  const [releaseNote, setReleaseNote] = useState('');
  const [changesText, setChangesText] = useState('');
  const [isConfirmingPublish, setConfirmingPublish] = useState(false);

  const errors = runCourseChecks(version.content).filter((check) => check.severity === 'error');
  const diff = diffCourseVersions(detail.publishedContent, version.content);
  const failure = publish.error ?? requestChanges.error ?? restore.error;

  return {
    errors,
    diff,
    releaseNote,
    setReleaseNote,
    changesText,
    setChangesText,
    canPublish: version.status === 'in_review' && errors.length === 0,
    canRequestChanges: version.status === 'in_review' && parseReviewItems(changesText).length > 0,
    canRestore: version.status === 'published' || version.status === 'superseded',
    isBusy: publish.isPending || requestChanges.isPending || restore.isPending,
    failureMessage: failure ? readErrorMessage(failure, 'Não foi possível concluir agora.') : null,
    isConfirmingPublish,
    askPublish: () => setConfirmingPublish(true),
    cancelPublish: () => setConfirmingPublish(false),
    publish: () =>
      publish.mutate(
        { id: version.id, revision: version.revision, releaseNote },
        {
          onSuccess: () => toast.show({ text: `Versão ${version.semver ?? ''} publicada.`, tone: 'success' }),
          onSettled: () => setConfirmingPublish(false),
        },
      ),
    requestChanges: () =>
      requestChanges.mutate(
        { id: version.id, revision: version.revision, text: changesText },
        { onSuccess: () => toast.show({ text: 'Ajustes pedidos. A pessoa vê os pontos no editor.', tone: 'info' }) },
      ),
    restore: () => restore.mutate(version.id, { onSuccess: () => toast.show({ text: 'Versão restaurada como rascunho.', tone: 'info' }) }),
  };
}
