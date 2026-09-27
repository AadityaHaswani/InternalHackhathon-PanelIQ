import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { createAuthRoutes } from '../modules/auth/auth.routes.js';
import { createCatalogRoutes } from '../modules/catalog/catalog.routes.js';
import { createSessionRoutes } from '../modules/sessions/session.routes.js';

export function createApiRoutes(verifyUser, createDatabaseClient) {
  const router = Router();
  router.use('/', healthRoutes);
  router.use('/', createAuthRoutes(verifyUser, createDatabaseClient));
  router.use('/', createCatalogRoutes(verifyUser, createDatabaseClient));
  router.use('/', createSessionRoutes(verifyUser, createDatabaseClient));
  return router;
}
