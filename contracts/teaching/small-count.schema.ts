import { z } from 'zod';

// null means "fewer than 5": the database hides small counts so no single student can be singled out.
export const smallCountSchema = z.number().int().min(5).nullable();
