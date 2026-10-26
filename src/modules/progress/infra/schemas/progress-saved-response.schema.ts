import { z } from 'zod';
import { progressRevisionSchema } from '@contracts/progress/progress-revision.schema';

export const progressSavedResponseSchema = z.object({ revision: progressRevisionSchema });
