import { z } from 'zod';

export const listQuestionsQuerySchema = z.object({
  search: z.string().optional(),
  stage: z.string().optional(),
  level: z.string().optional(),
});

export const publishQuestionParamsSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
});

export const createAssignmentSchema = z.object({
  sessionId: z.string().uuid().optional(),
  evaluatorId: z.string().min(1).optional(),
  session_id: z.string().uuid().optional(),
  evaluator_id: z.string().min(1).optional(),
}).refine(
  (data) => (data.sessionId || data.session_id) && (data.evaluatorId || data.evaluator_id),
  { message: 'Both sessionId and evaluatorId are required' }
);
