import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';

const router = Router();

// Mount module routes
router.use('/', healthRoutes);

export const apiRoutes = router;
