import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { createAuthRoutes } from '../modules/auth/auth.routes.js';

export function createApiRoutes(verifyUser, createDatabaseClient) {
  const router = Router();
  router.use('/', healthRoutes);
  router.use('/', createAuthRoutes(verifyUser, createDatabaseClient));
  return router;
}
