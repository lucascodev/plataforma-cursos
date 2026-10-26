import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { useNewVersionAvailable } from '@/shared/presentation/hooks/use-new-version-available/use-new-version-available';
import styles from './new-version-banner.module.css';

export function NewVersionBanner() {
  const isAvailable = useNewVersionAvailable();
  if (!isAvailable) return null;
  return (
    <div className={styles.wrapper}>
      <Banner
        tone="accent"
        title="Saiu uma versão nova do site."
        action={
          <Button tone="primary" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        }
      >
        <p>Seu progresso fica salvo. Recarregue quando terminar o que está fazendo.</p>
      </Banner>
    </div>
  );
}
