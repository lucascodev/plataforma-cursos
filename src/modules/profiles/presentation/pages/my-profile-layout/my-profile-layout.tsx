import { Outlet, useLocation } from 'react-router';
import { RequireRole } from '@/modules/auth';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { ProfileHeader } from '../../components/profile-header/profile-header';
import { ProfileTabs } from '../../components/profile-tabs/profile-tabs';
import { useMyProfileQuery } from '../../hooks/use-my-profile-query/use-my-profile-query';
import styles from './my-profile-layout.module.css';

const ALL_ROLES = ['student', 'teacher', 'admin'] as const;

function MyProfileContent() {
  const profile = useMyProfileQuery();
  if (profile.isPending) return <PageStatus title="Carregando seu perfil…" />;
  if (profile.isError) return <PageStatus title="Não foi possível carregar seu perfil" />;

  return (
    <div className={styles.page}>
      <title>Meu perfil</title>
      <ProfileHeader displayName={profile.data.displayName} handle={profile.data.handle} avatarUrl={profile.data.avatarUrl} role={profile.data.role} />
      <ProfileTabs />
      <Outlet />
    </div>
  );
}

export function MyProfileLayout() {
  const location = useLocation();
  return (
    <RequireRole roles={ALL_ROLES} returnPath={location.pathname}>
      <MyProfileContent />
    </RequireRole>
  );
}
