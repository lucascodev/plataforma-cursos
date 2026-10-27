import { z } from 'zod';

export const reviewItemResolutionSchema = z.object({ versionId: z.guid(), resolved: z.boolean() });
