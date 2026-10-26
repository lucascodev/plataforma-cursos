import { PROFILE_HANDLE_PATTERN } from '../../../../contracts/profile/profile-handle-pattern';

export function isProfileHandle(value: string): boolean {
  return PROFILE_HANDLE_PATTERN.test(value);
}
