import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import * as schema from './session.schema.js';
import * as service from './session.service.js';

function parse(validator, value) {
  const result = validator.safeParse(value);
  if (!result.success) throw new service.SessionError(400, 'INVALID_REQUEST', 'Invalid request fields or Idempotency-Key');
  return result.data;
}
export function createSessionRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.use('/sessions', requireAuth(verifyUser));
  const handle = (action, status = 200) => async (req, res, next) => {
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const data = await action(req, client);
      res.status(status).json({ data, requestId: req.id });
    } catch (error) {
      next(error instanceof service.SessionError ? error : new Error('Interview operation failed'));
    }
  };
  router.post('/sessions', handle(async (req, client) => {
    parse(schema.createSessionSchema, req.body);
    return { session: await service.createSession(client, req.user.id) };
  }, 201));
  router.get('/sessions', handle((req, client) => service.listSessions(client, req.user.id, parse(schema.listSessionsSchema, req.query))));
  router.get('/sessions/:id', handle(async (req, client) => ({
    session: await service.getSession(client, parse(schema.sessionIdSchema, req.params.id)),
  })));
  for (const skip of [false, true]) {
    router.post(`/sessions/:id/${skip ? 'skip' : 'answers'}`, handle((req, client) => service.saveTurn(
      client, parse(schema.sessionIdSchema, req.params.id), parse(skip ? schema.skipSchema : schema.answerSchema, req.body),
      parse(schema.idempotencySchema, req.get('Idempotency-Key')), skip,
    )));
  }
  router.post('/sessions/:id/complete', handle(async (req, client) => ({
    session: await service.completeSession(client, parse(schema.sessionIdSchema, req.params.id),
      parse(schema.completeSchema, req.body).expectedSessionVersion),
  })));
  return router;
}
