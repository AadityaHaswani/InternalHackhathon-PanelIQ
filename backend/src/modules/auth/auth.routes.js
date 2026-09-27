import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { createRequestClient } from '../../config/supabase-request-client.js';
import { profilePatchSchema } from '../profiles/profile.schema.js';
import { readProfile, saveProfile } from '../profiles/profile.service.js';

// One routing owner for GET/PATCH /me. The client factory is an offline test seam.
export function createAuthRoutes(verifyUser, createDatabaseClient = createRequestClient) {
  const router = Router();
  const handleMe = (save) => async (req, res, next) => {
    let patch;
    if (save) {
      const parsed = profilePatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(Object.assign(new Error('Provide at least one valid profile field and no unknown fields'), {
          status: 400, code: 'INVALID_PROFILE',
        }));
      }
      patch = parsed.data;
    }
    try {
      const client = createDatabaseClient(req.verifiedAccessToken);
      const profile = save
        ? await saveProfile(client, req.user.id, patch)
        : await readProfile(client, req.user.id);
      return res.json({ data: { user: req.user, profile }, requestId: req.id });
    } catch (error) {
      // Only service-generated safe errors reach the shared logger/handler.
      if (['PROFILE_FORBIDDEN', 'AUTH_INVALID', 'DATABASE_UNAVAILABLE', 'PROFILE_CONFLICT'].includes(error.code)) {
        return next(error);
      }
      return next(new Error('Profile operation failed'));
    }
  };
  router.get('/me', requireAuth(verifyUser), handleMe(false));
  router.patch('/me', requireAuth(verifyUser), handleMe(true));
  return router;
}
