import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import * as schema from './evaluation.schema.js';
import * as service from './evaluation.service.js';
import { SessionError } from '../sessions/session.service.js';

function parse(validator, value) {
  const result = validator.safeParse(value);
  if (!result.success) {
    throw new SessionError(400, 'INVALID_REQUEST', result.error.errors[0]?.message || 'Invalid request fields');
  }
  return result.data;
}

export function createEvaluationRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.use('/evaluations', requireAuth(verifyUser));

  const handle = (action, status = 200) => async (req, res, next) => {
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const data = await action(req, client);
      res.status(status).json({ data, requestId: req.id });
    } catch (error) {
      next(error instanceof SessionError ? error : new SessionError(500, 'INTERNAL_ERROR', error.message || 'Evaluation operation failed'));
    }
  };

  router.post('/evaluations/:id/overrides', handle(async (req, client) => {
    const id = parse(schema.evaluationIdSchema, req.params.id);
    const body = parse(schema.overrideEvaluationSchema, req.body);
    return await service.addReviewOverride(client, req.user.id, id, body);
  }));

  return router;
}
