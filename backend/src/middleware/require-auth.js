import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { verifyAccessToken } from '../config/supabase.js';

function reject(res, requestId, status, code, message, retryable = false) {
  return res.status(status).json({ error: { code, message, retryable }, requestId });
}

function handleVerificationError(error, req, res, next) {
  if (isAuthRetryableFetchError(error) || error?.status === 429 ||
      error?.status >= 500 || ['TimeoutError', 'AbortError'].includes(error?.name)) {
    return reject(res, req.id, 503, 'AUTH_UNAVAILABLE',
      'Authentication is temporarily unavailable. Try again later.', true);
  }
  if (isAuthError(error) && [400, 401, 403, 422].includes(error.status)) {
    return reject(res, req.id, 401, 'AUTH_INVALID', 'Invalid or expired access token');
  }
  // Do not pass provider messages, response bodies or tokens to the logger.
  return next(new Error('Unexpected authentication verification failure'));
}

// The optional verifier is an in-process test seam, never a request/config bypass.
export function requireAuth(verifyUser = verifyAccessToken) {
  return async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const authorization = req.get('authorization');
    if (!authorization) {
      return reject(res, req.id, 401, 'AUTH_REQUIRED', 'A Bearer access token is required');
    }
    const match = /^Bearer +([A-Za-z0-9._~+/-]+=*)$/i.exec(authorization);
    if (!match || match[1].startsWith('sb_')) {
      return reject(res, req.id, 401, 'AUTH_INVALID', 'Invalid Bearer credentials');
    }

    try {
      const { data, error } = await verifyUser(match[1]);
      if (error) return handleVerificationError(error, req, res, next);
      const user = data?.user;
      if (!user || typeof user.id !== 'string' || !user.id.trim()) {
        return reject(res, req.id, 401, 'AUTH_INVALID', 'Invalid or expired access token');
      }
      req.user = { id: user.id, email: typeof user.email === 'string' ? user.email : null };
      return next();
    } catch (error) {
      return handleVerificationError(error, req, res, next);
    }
  };
}
