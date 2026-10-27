import { z } from 'zod';

export const accountBlockSchema = z.object({ blocked: z.boolean() });
