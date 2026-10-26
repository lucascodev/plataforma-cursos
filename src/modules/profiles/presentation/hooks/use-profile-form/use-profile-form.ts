import { profileUpdateSchema } from '@contracts/profile-update.schema';
import { useState, type FormEvent } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { ProfileLink } from '../../../domain/entities/profile-link.entity';
import type { MyProfile } from '../../../domain/entities/my-profile.entity';
import { useUpdateProfileMutation } from '../use-update-profile-mutation/use-update-profile-mutation';

const MAX_LINKS = 5;
const EMPTY_LINK: ProfileLink = { label: '', url: '' };

export function useProfileForm(profile: MyProfile) {
  const mutation = useUpdateProfileMutation();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [links, setLinks] = useState<readonly ProfileLink[]>(profile.links);
  const [showStudentCount, setShowStudentCount] = useState(profile.showStudentCount);
  const [validationError, setValidationError] = useState<string | null>(null);

  const filledLinks = links.filter((link) => link.label.trim() || link.url.trim());

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = profileUpdateSchema.safeParse({ displayName, bio, links: filledLinks, showStudentCount });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.path[0] === 'links' ? 'Cada link precisa de um nome e de um endereço https.' : (parsed.error.issues[0]?.message ?? 'Confira os dados.'));
      return;
    }
    setValidationError(null);
    mutation.mutate(parsed.data);
  };

  return {
    displayName,
    bio,
    links,
    showStudentCount,
    canAddLink: links.length < MAX_LINKS,
    isSaving: mutation.isPending,
    saved: mutation.isSuccess,
    error: validationError ?? (mutation.isError ? readErrorMessage(mutation.error, 'Não foi possível salvar agora.') : null),
    setDisplayName,
    setBio,
    setShowStudentCount,
    addLink: () => setLinks((current) => (current.length < MAX_LINKS ? [...current, EMPTY_LINK] : current)),
    updateLink: (index: number, patch: Partial<ProfileLink>) =>
      setLinks((current) => current.map((link, position) => (position === index ? { ...link, ...patch } : link))),
    removeLink: (index: number) => setLinks((current) => current.filter((_, position) => position !== index)),
    submit,
  };
}
