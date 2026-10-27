import { useState } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import { VersionConflictError } from '../../../application/errors/version-conflict.error';
import type { CourseWorkspace } from '../../../domain/entities/course-workspace.entity';
import type { OpenVersion } from '../../../domain/entities/versions/open-version.entity';
import type { ReviewItem } from '../../../domain/entities/versions/review-item.entity';
import type { SubmittableVersionKind } from '../../../domain/types/version-kind.type';
import { countOpenReviewItems } from '../../../domain/rules/version/count-open-review-items.rule';
import type { EditorTab } from '../../types/editor-tab.type';
import { useCourseEditor } from '../use-course-editor/use-course-editor';
import { useResolveReviewItemMutation } from '../use-resolve-review-item-mutation/use-resolve-review-item-mutation';
import { useSubmitVersionMutation } from '../use-submit-version-mutation/use-submit-version-mutation';
import { useWithdrawVersionMutation } from '../use-withdraw-version-mutation/use-withdraw-version-mutation';

const CONFLICT_MESSAGE = 'Este rascunho foi alterado em outra aba ou aparelho. Recarregue a página para continuar.';

export function useCourseEditorView(slug: string, workspace: CourseWorkspace, version: OpenVersion) {
  const editor = useCourseEditor(slug, version, workspace.publishedContent);
  const toast = useToast();
  const submit = useSubmitVersionMutation();
  const withdraw = useWithdrawVersionMutation(slug);
  const resolve = useResolveReviewItemMutation();
  const [tab, setTab] = useState<EditorTab>('modules');
  const [isSubmitOpen, setSubmitOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<readonly ReviewItem[]>(version.reviewItems);

  const errorCount = editor.checks.filter((check) => check.severity === 'error').length;
  const openReviewItems = countOpenReviewItems({ reviewItems });
  const canSubmit = editor.isEditable && errorCount === 0 && openReviewItems === 0 && editor.saveStatus !== 'conflict';

  const sendForReview = async (kind: SubmittableVersionKind, message: string) => {
    setSubmitError(null);
    const revision = await editor.flush();
    if (revision === null) {
      setSubmitError('Não foi possível salvar o rascunho. Confira a conexão e tente de novo.');
      return;
    }
    submit.mutate(
      { slug, versionId: version.id, revision, kind, message },
      {
        onSuccess: (sent) => {
          setSubmitOpen(false);
          toast.show({ text: `Versão ${sent.semver ?? ''} enviada para revisão.`, tone: 'success' });
        },
        onError: (error) =>
          setSubmitError(error instanceof VersionConflictError ? CONFLICT_MESSAGE : readErrorMessage(error, 'Não foi possível enviar agora.')),
      },
    );
  };

  const withdrawFromReview = () =>
    withdraw.mutate(version.id, {
      onSuccess: () => toast.show({ text: 'Versão retirada da revisão. Você pode editar de novo.', tone: 'info' }),
      onError: (error) => toast.show({ text: readErrorMessage(error, 'Não foi possível retirar agora.'), tone: 'warning' }),
    });

  const toggleReviewItem = (itemId: string, resolved: boolean) =>
    resolve.mutate(
      { slug, versionId: version.id, itemId, resolved },
      {
        onSuccess: setReviewItems,
        onError: (error) => toast.show({ text: readErrorMessage(error, 'Não foi possível marcar o ajuste agora.'), tone: 'warning' }),
      },
    );

  return {
    editor,
    tab,
    setTab,
    errorCount,
    reviewItems,
    canSubmit,
    isSubmitOpen,
    submitError,
    isSubmitting: submit.isPending,
    isWithdrawing: withdraw.isPending,
    isResolving: resolve.isPending,
    openSubmit: () => {
      setSubmitError(null);
      setSubmitOpen(true);
    },
    closeSubmit: () => setSubmitOpen(false),
    sendForReview,
    withdrawFromReview,
    toggleReviewItem,
  };
}
