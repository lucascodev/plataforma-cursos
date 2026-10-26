import { Link } from 'react-router';
import { AccountSettingsForm } from '../../components/account-settings-form/account-settings-form';
import { useAccountSettingsQuery } from '../../hooks/use-account-settings-query/use-account-settings-query';
import styles from './account-tab-page.module.css';

export function AccountTabPage() {
  const settings = useAccountSettingsQuery();
  if (settings.isPending) return <p className={styles.status}>Carregando preferências…</p>;
  if (settings.isError) return <p className={styles.status}>Não foi possível carregar suas preferências agora.</p>;

  return (
    <div className={styles.tab}>
      <AccountSettingsForm settings={settings.data} />
      <p className={styles.note}>
        Para baixar ou apagar o progresso de um curso, use a seção "Seus dados" na página do curso. Saiba o que guardamos em{' '}
        <Link to="/privacidade">Privacidade</Link>.
      </p>
    </div>
  );
}
