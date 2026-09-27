import { z } from 'zod';

export const evaluationIdSchema = z.string().uuid();

export const overrideEvaluationSchema = z.object({
  oldRating: z.number().int().min(0).max(4).nullable().optional(),
  newRating: z.number().int().min(0).max(4),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters long').max(1000),
  expectedRevision: z.number().int().positive().optional(),
}).strict();

export const evidenceSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  excerpt: z.string(),
}).strict();

export const createEvaluationSchema = z.object({
  answerId: z.string().uuid(),
  criterionId: z.enum(['correctness', 'reasoning', 'relevance', 'tradeoffs']),
  rating: z.number().int().min(0).max(4).nullable(),
  applicable: z.boolean().default(true),
  rationale: z.string().max(2000).optional().default(''),
  missingPoints: z.array(z.string()).optional().default([]),
  evidence: evidenceSchema.optional().nullable(),
  source: z.enum(['ai', 'human', 'answer_key', 'metadata_rule', 'system']).default('ai'),
  reportRevision: z.number().int().positive().default(1),
}).strict();
