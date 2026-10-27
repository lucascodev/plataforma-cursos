import { useState } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import type { AdminCourse } from '../../../domain/entities/admin-course.entity';
import type { UnlistReason } from '../../../domain/types/unlist-reason.type';
import { useCourseListingMutation } from '../use-course-listing-mutation/use-course-listing-mutation';
import { useCourseOwnerMutation } from '../use-course-owner-mutation/use-course-owner-mutation';
import { useDeleteCourseMutation } from '../use-delete-course-mutation/use-delete-course-mutation';

type Dialog = 'unlist' | 'transfer' | 'delete' | null;

export function useCourseRowActions(course: AdminCourse) {
  const toast = useToast();
  const listing = useCourseListingMutation();
  const owner = useCourseOwnerMutation();
  const remove = useDeleteCourseMutation();
  const [dialog, setDialog] = useState<Dialog>(null);
  const failure = listing.error ?? owner.error ?? remove.error;

  const close = () => {
    setDialog(null);
    listing.reset();
    owner.reset();
    remove.reset();
  };
  const done = (text: string) => () => {
    setDialog(null);
    toast.show({ text, tone: 'success' });
  };

  return {
    dialog,
    isBusy: listing.isPending || owner.isPending || remove.isPending,
    error: failure ? readErrorMessage(failure, 'Não foi possível concluir agora.') : null,
    open: (next: Exclude<Dialog, null>) => setDialog(next),
    close,
    relist: () =>
      listing.mutate({ slug: course.slug, listed: true, reason: null, note: '' }, { onSuccess: done(`${course.title} voltou ao catálogo.`) }),
    unlist: (reason: UnlistReason, note: string) =>
      listing.mutate({ slug: course.slug, listed: false, reason, note }, { onSuccess: done(`${course.title} saiu do catálogo.`) }),
    transfer: (handle: string) => owner.mutate({ slug: course.slug, handle }, { onSuccess: done(`${course.title} foi transferido.`) }),
    remove: () => remove.mutate(course.slug, { onSuccess: done(`${course.title} foi excluído.`) }),
  };
}
