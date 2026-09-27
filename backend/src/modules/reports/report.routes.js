import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import * as schema from './report.schema.js';
import * as service from './report.service.js';
import { SessionError } from '../sessions/session.service.js';

function parse(validator, value) {
  const result = validator.safeParse(value);
  if (!result.success) {
    throw new SessionError(400, 'INVALID_REQUEST', result.error.errors[0]?.message || 'Invalid request parameters');
  }
  return result.data;
}

export function createReportRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.use(requireAuth(verifyUser));

  const handle = (action, status = 200) => async (req, res, next) => {
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const data = await action(req, client);
      res.status(status).json({ data, requestId: req.id });
    } catch (error) {
      next(error instanceof SessionError ? error : new SessionError(500, 'INTERNAL_ERROR', error.message || 'Report operation failed'));
    }
  };

  router.get('/sessions/:id/report', handle(async (req, client) => {
    const sessionId = parse(schema.sessionIdSchema, req.params.id);
    return await service.getSessionReport(client, req.user.id, sessionId);
  }));

  router.get('/sessions/:id/replay', handle(async (req, client) => {
    const sessionId = parse(schema.sessionIdSchema, req.params.id);
    return await service.getSessionReplay(client, req.user.id, sessionId);
  }));

  router.post('/sessions/:id/release', handle(async (req, client) => {
    const sessionId = parse(schema.sessionIdSchema, req.params.id);
    const body = parse(schema.releaseReportSchema, req.body);
    return await service.releaseReport(client, req.user.id, sessionId, body);
  }));

  router.get('/review-assignments', handle(async (req, client) => {
    const hasPagination = req.query.limit !== undefined || req.query.offset !== undefined;
    const pagination = parse(schema.listAssignmentsSchema, req.query);
    const result = await service.listReviewAssignments(client, req.user.id, pagination);
    if (!hasPagination) {
      return result.assignments;
    }
    return result;
  }));

  return router;
}
