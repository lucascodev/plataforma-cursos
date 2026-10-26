import type { SiteConfig } from '../../domain/types/site-config.type';
import { readSiteConfig } from '../../infra/config/read-site-config';

let siteConfig: SiteConfig | null = null;

export function makeSiteConfig(): SiteConfig {
  siteConfig ??= readSiteConfig();
  return siteConfig;
}
