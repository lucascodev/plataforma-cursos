import siteContent from '../../../../content/site.json';
import type { SiteConfig } from '../../domain/types/site-config.type';
import { siteConfigSchema } from './site-config.schema';

export function readSiteConfig(): SiteConfig {
  return siteConfigSchema.parse(siteContent);
}
