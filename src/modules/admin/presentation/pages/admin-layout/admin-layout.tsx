import { Outlet, useLocation } from 'react-router';
import { RequireRole } from '@/modules/auth';
import { AdminNav } from '../../components/admin-nav/admin-nav';
import styles from './admin-layout.module.css';

const ADMIN_ONLY = ['admin'] as const;

export function AdminLayout() {
  const location = useLocation();
  return (
    <RequireRole roles={ADMIN_ONLY} returnPath={location.pathname}>
      <div className={styles.layout}>
        <AdminNav />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </RequireRole>
  );
}
