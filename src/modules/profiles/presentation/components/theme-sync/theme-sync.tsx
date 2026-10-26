import { useEffect } from 'react';
import { useAccountSettingsQuery } from '../../hooks/use-account-settings-query/use-account-settings-query';

// Applies the saved theme to <html>. Signed out, or before the settings load, the device preference wins.
export function ThemeSync() {
  const theme = useAccountSettingsQuery().data?.theme ?? 'system';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
