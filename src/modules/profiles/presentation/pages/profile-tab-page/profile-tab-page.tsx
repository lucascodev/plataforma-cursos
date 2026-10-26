import { ProfileForm } from '../../components/profile-form/profile-form';
import { useMyProfileQuery } from '../../hooks/use-my-profile-query/use-my-profile-query';

export function ProfileTabPage() {
  const profile = useMyProfileQuery();
  if (!profile.data) return null;
  return <ProfileForm key={profile.data.id} profile={profile.data} />;
}
