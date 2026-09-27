import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import * as schema from './question-assessment.schema.js';
import * as service from './question-assessment.service.js';
import { SessionError } from '../sessions/session.service.js';

function parse(validator, value) {
  const result = validator.safeParse(value);
  if (!result.success) {
    throw new SessionError(400, 'INVALID_REQUEST', result.error.errors[0]?.message || 'Invalid request parameters');
  }
  return result.data;
}

export function createQuestionAssessmentRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.use('/question-assessments', requireAuth(verifyUser));

  const handle = (action, status = 200) => async (req, res, next) => {
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const data = await action(req, client);
      res.status(status).json({ data, requestId: req.id });
    } catch (error) {
      next(error instanceof SessionError ? error : new SessionError(500, 'INTERNAL_ERROR', error.message || 'Assessment operation failed'));
    }
  };

  router.post('/question-assessments', handle(async (req, client) => {
    const body = parse(schema.createAssessmentSchema, req.body);
    return await service.createQuestionAssessment(client, req.user.id, body);
  }, 201));

  router.get('/question-assessments/:id', handle(async (req, client) => {
    const id = parse(schema.assessmentIdSchema, req.params.id);
    return await service.getQuestionAssessment(client, req.user.id, id);
  }));

  return router;
}
