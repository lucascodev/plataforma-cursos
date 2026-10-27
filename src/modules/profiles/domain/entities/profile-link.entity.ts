import type { ProfileLinkKind } from '../types/profile-link-kind.type';

export interface ProfileLink {
  readonly label: string;
  readonly url: string;
  readonly kind?: ProfileLinkKind;
}
