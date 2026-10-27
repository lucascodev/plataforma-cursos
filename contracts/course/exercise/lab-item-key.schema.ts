import { z } from 'zod';

export const labItemKeySchema = z.string().regex(/^[a-z0-9-]{1,60}-t[a-z0-9]{1,12}$/);
