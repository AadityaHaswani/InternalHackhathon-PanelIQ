import { z } from 'zod';

export const sessionIdSchema = z.string().uuid();

export const releaseReportSchema = z.object({
  summary: z.string().max(2000).optional(),
}).strict().default({});

export const listAssignmentsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
}).strict();
