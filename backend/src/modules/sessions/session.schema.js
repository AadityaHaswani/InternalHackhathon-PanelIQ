import { z } from 'zod';

export const sessionIdSchema = z.string().uuid();
export const createSessionSchema = z.object({}).strict();
export const listSessionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
}).strict();
export const idempotencySchema = z.string().regex(/^[A-Za-z0-9_-]{8,128}$/);
const turnFields = {
  turnId: z.string().uuid(),
  expectedSessionVersion: z.number().int().positive().max(2147483646),
};
export const answerSchema = z.object({
  ...turnFields,
  answerText: z.string().trim().min(1).refine((text) => [...text].length <= 2000 && !text.includes('\0')),
}).strict();
export const skipSchema = z.object({ ...turnFields, confirm: z.literal(true) }).strict();
export const completeSchema = z.object({ expectedSessionVersion: turnFields.expectedSessionVersion }).strict();
