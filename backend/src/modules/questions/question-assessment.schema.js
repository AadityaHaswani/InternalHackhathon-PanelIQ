import { z } from 'zod';

export const assessmentIdSchema = z.string().uuid();

export const createAssessmentSchema = z.object({
  targetRole: z.string().default('backend_developer'),
  experienceLevel: z.enum(['junior', 'intermediate']),
  requiredTopicTags: z.array(z.enum(['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs'])).min(1),
  proposedQuestion: z.string().trim().min(20, 'Proposed question must be at least 20 characters').max(2000),
  contextNotes: z.string().max(1000).optional(),
}).strict();
