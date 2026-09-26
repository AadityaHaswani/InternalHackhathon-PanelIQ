import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';

export function createAuthRoutes(verifyUser) {
  const router = Router();
  router.get('/me', requireAuth(verifyUser), (req, res) => {
    res.json({ data: { user: req.user }, requestId: req.id });
  });
  return router;
}
