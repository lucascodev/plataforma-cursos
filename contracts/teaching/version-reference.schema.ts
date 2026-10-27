import { z } from 'zod';

export const versionReferenceSchema = z.object({ versionId: z.guid() });
