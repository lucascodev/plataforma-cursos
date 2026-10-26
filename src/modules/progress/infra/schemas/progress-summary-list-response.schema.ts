import { progressSummarySchema } from '@contracts/progress/progress-summary.schema';
import { z } from 'zod';

export const progressSummaryListResponseSchema = z.object({ items: z.array(progressSummarySchema).max(50) });
