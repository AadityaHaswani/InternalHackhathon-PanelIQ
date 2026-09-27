import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { createApiRoutes } from './routes/index.js';

/**
 * Constructs and configures the Express application.
 * Does not start listening so it can be imported cleanly for testing.
 */
export function createApp({ verifyUser, createDatabaseClient } = {}) {
  const app = express();

  // 1. Request ID tracking (must be first)
  app.use(requestIdMiddleware);

  // 2. CORS configuration with explicit allowlist
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, PowerShell Invoke-RestMethod, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      const corsError = new Error(`Origin ${origin} not allowed by CORS`);
      corsError.status = 403;
      corsError.code = 'FORBIDDEN';
      return callback(corsError);
    },
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Identity responses, including JSON parse errors, must not be cached.
  app.use(['/api/v1/me', '/api/v1/catalog', '/api/v1/sessions', '/api/v1/evaluations', '/api/v1/review-assignments', '/api/v1/question-assessments', '/api/v1/retries', '/api/v1/admin'], (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // 3. JSON body parsing with reasonable limit (1MB)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Mount API routes under /api/v1
  app.use('/api/v1', createApiRoutes(verifyUser, createDatabaseClient));

  // 5. JSON 404 handler for unmatched routes
  app.use(notFoundHandler);

  // 6. Central error handler
  app.use(errorHandler);

  return app;
}
