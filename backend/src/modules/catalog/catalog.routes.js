import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import { stages, topics, levels } from '../sessions/session-plan.js';
import { supportedRoles, SessionError } from '../sessions/session.service.js';

export function createCatalogRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  router.get('/catalog', requireAuth(verifyUser), async (req, res, next) => {
    try {
      const roles = await supportedRoles(createDatabaseClient(req.verifiedAccessToken));
      res.json({ data: { domains: ['computer_science'], levels, stages, topics,
        roles: roles.map(({ slug, domain, label }) => ({ slug, domain, label })) }, requestId: req.id });
    } catch (error) {
      next(error instanceof SessionError ? error : new Error('Catalog operation failed'));
    }
  });
  return router;
}
