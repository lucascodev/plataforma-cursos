import { z } from 'zod';
import { timestampSchema } from '../date/timestamp.schema.ts';
import { semverSchema } from '../version/semver.schema.ts';

export const attentionItemSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('proposal'), id: z.guid(), title: z.string().max(200), since: timestampSchema }),
  z.object({
    kind: z.literal('version'),
    id: z.guid(),
    title: z.string().max(200),
    semver: semverSchema.nullable(),
    firstPublication: z.boolean(),
    since: timestampSchema,
  }),
  z.object({
    kind: z.literal('report'),
    id: z.guid(),
    title: z.string().max(200),
    handle: z.string().max(40),
    count: z.number().int().min(1),
    since: timestampSchema,
  }),
]);

export type AttentionItemRecord = z.infer<typeof attentionItemSchema>;
