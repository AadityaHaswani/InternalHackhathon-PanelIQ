import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import * as schema from './retry.schema.js';
import * as service from './retry.service.js';
import { SessionError } from '../sessions/session.service.js';

function parse(validator, value) {
  const result = validator.safeParse(value);
  if (!result.success) {
    throw new SessionError(400, 'INVALID_REQUEST', result.error.errors[0]?.message || 'Invalid request fields');
  }
  return result.data;
}

export function createRetryRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.use('/sessions', requireAuth(verifyUser));
  router.use('/retries', requireAuth(verifyUser));

  const handle = (action, status = 200) => async (req, res, next) => {
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const data = await action(req, client);
      res.status(status).json({ data, requestId: req.id });
    } catch (error) {
      next(error instanceof SessionError ? error : new SessionError(500, 'INTERNAL_ERROR', error.message || 'Retry operation failed'));
    }
  };

  // 1. Create a retry attempt for an eligible answer
  router.post('/sessions/:id/answers/:answerId/retry', handle(async (req, client) => {
    return { retry: await service.createRetryAttempt(client, req.user.id, req.params.id, req.params.answerId) };
  }, 201));

  // 2. Submit answer to a retry attempt
  router.post('/retries/:retryId/answer', handle(async (req, client) => {
    const body = parse(schema.submitRetryAnswerSchema, req.body);
    return { retry: await service.submitRetryAnswer(client, req.user.id, req.params.retryId, body) };
  }));

  // 3. Get retry attempt details
  router.get('/retries/:retryId', handle(async (req, client) => {
    return { retry: await service.getRetryAttempt(client, req.user.id, req.params.retryId) };
  }));

  return router;
}
