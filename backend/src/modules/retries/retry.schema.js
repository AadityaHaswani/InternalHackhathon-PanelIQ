import { z } from 'zod';

export const createRetrySchema = z.object({
  expectedSessionVersion: z.number().int().positive().optional(),
});

export const submitRetryAnswerSchema = z.object({
  answerText: z
    .string()
    .trim()
    .min(1, 'Answer text cannot be empty')
    .max(2000, 'Answer text cannot exceed 2000 characters')
    .refine((val) => !val.includes('\0'), 'Answer text cannot contain null bytes'),
  idempotencyKey: z
    .string()
    .regex(/^[A-Za-z0-9_-]{8,128}$/, 'Idempotency key must be 8-128 characters (letters, numbers, underscore, hyphen)'),
});
