import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { createAuthRoutes } from '../modules/auth/auth.routes.js';
import { createCatalogRoutes } from '../modules/catalog/catalog.routes.js';
import { createSessionRoutes } from '../modules/sessions/session.routes.js';
import { createEvaluationRoutes } from '../modules/evaluations/evaluation.routes.js';
import { createReportRoutes } from '../modules/reports/report.routes.js';
import { createQuestionAssessmentRoutes } from '../modules/questions/question-assessment.routes.js';
import { createRetryRoutes } from '../modules/retries/retry.routes.js';
import { createAdminRoutes } from '../modules/admin/admin.routes.js';

export function createApiRoutes(verifyUser, createDatabaseClient) {
  const router = Router();
  router.use('/', healthRoutes);
  router.use('/', createAuthRoutes(verifyUser, createDatabaseClient));
  router.use('/', createCatalogRoutes(verifyUser, createDatabaseClient));
  router.use('/', createSessionRoutes(verifyUser, createDatabaseClient));
  router.use('/', createEvaluationRoutes(verifyUser, createDatabaseClient));
  router.use('/', createReportRoutes(verifyUser, createDatabaseClient));
  router.use('/', createQuestionAssessmentRoutes(verifyUser, createDatabaseClient));
  router.use('/', createRetryRoutes(verifyUser, createDatabaseClient));
  router.use('/', createAdminRoutes(verifyUser, createDatabaseClient));
  return router;
}

