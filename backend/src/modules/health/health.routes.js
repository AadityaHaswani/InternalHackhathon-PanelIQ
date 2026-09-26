import { Router } from 'express';

const router = Router();

/**
 * GET /api/v1/health
 * Confirms the Express process is running.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    data: {
      service: 'paneliq-backend',
      status: 'ok',
    },
    requestId: req.id,
  });
});

export const healthRoutes = router;
