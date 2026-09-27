import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import * as schema from './admin.schema.js';
import * as service from './admin.service.js';
import { SessionError } from '../sessions/session.service.js';

function parse(validator, value) {
  const result = validator.safeParse(value);
  if (!result.success) {
    throw new SessionError(400, 'INVALID_REQUEST', result.error.errors[0]?.message || 'Invalid request parameters');
  }
  return result.data;
}

export function createAdminRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.use('/admin', requireAuth(verifyUser));

  const handle = (action, status = 200) => async (req, res, next) => {
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const data = await action(req, client);
      res.status(status).json({ data, requestId: req.id });
    } catch (error) {
      next(
        error instanceof SessionError
          ? error
          : new SessionError(500, 'INTERNAL_ERROR', error.message || 'Admin operation failed')
      );
    }
  };

  // 1. Question Bank Administration
  router.get('/admin/questions', handle(async (req, client) => {
    const filters = parse(schema.listQuestionsQuerySchema, req.query);
    return await service.listAdminQuestions(client, req.user.id, req.user, filters);
  }));

  router.post('/admin/questions/:id/publish', handle(async (req, client) => {
    const params = parse(schema.publishQuestionParamsSchema, req.params);
    return await service.publishQuestion(client, req.user.id, req.user, params.id);
  }));

  // 2. Evaluator Assignments Administration
  router.get('/admin/sessions', handle(async (req, client) => {
    return await service.listCompletedSessions(client, req.user.id, req.user);
  }));

  router.get('/admin/evaluators', handle(async (req, client) => {
    return await service.listApprovedEvaluators(client, req.user.id, req.user);
  }));

  router.post('/admin/assignments', handle(async (req, client) => {
    const body = parse(schema.createAssignmentSchema, req.body);
    const sessionId = body.sessionId || body.session_id;
    const evaluatorId = body.evaluatorId || body.evaluator_id;
    return await service.createReviewAssignment(client, req.user.id, req.user, { sessionId, evaluatorId });
  }, 201));

  return router;
}
