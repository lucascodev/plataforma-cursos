import { z } from 'zod';

export const siteConfigSchema = z.object({
  name: z.string().trim().min(1).max(60),
  tagline: z.string().trim().min(1).max(200),
  repositoryUrl: z.string().url().startsWith('https://'),
  codeLicense: z.string().trim().min(1).max(40),
  contentLicense: z.string().trim().min(1).max(40),
});
