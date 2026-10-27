import { BriefcaseBusiness, Code, Globe, Link as LinkIcon, type LucideIcon } from 'lucide-react';
import type { ProfileLinkKind } from '../../../domain/types/profile-link-kind.type';

const ICONS: Readonly<Record<ProfileLinkKind, LucideIcon>> = {
  site: Globe,
  linkedin: BriefcaseBusiness,
  github: Code,
  other: LinkIcon,
};

export function ProfileLinkIcon({ kind }: { readonly kind: ProfileLinkKind | undefined }) {
  const Icon = ICONS[kind ?? 'other'];
  return <Icon size={16} aria-hidden="true" />;
}
