import { env } from '../config/env.js';

/**
 * Global error handling middleware.
 * Ensures all errors return a consistent JSON envelope and prevents leaking stack traces.
 */
export function errorHandler(err, req, res, _next) {
  const requestId = req.id || 'unknown';

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected internal error occurred';
  const retryable = false;

  // Handle body parser errors
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400))) {
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request payload exceeds size limit';
  } else if (err.status && typeof err.status === 'number') {
    statusCode = err.status;
    code = err.code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 403 ? 'FORBIDDEN' : 'REQUEST_ERROR');
    message = err.message || message;
  } else if (err.statusCode && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    code = err.code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 403 ? 'FORBIDDEN' : 'REQUEST_ERROR');
    message = err.message || message;
  }

  // Server-side logging (suppressed in test)
  if (env.NODE_ENV !== 'test') {
    console.error(`[Error] [${requestId}] ${statusCode} ${code} - ${err.message}`);
    if (statusCode >= 500 && err.stack) {
      console.error(err.stack);
    }
  }

  // Client response matching the standard envelope
  res.status(statusCode).json({
    error: {
      code,
      message,
      retryable,
    },
    requestId,
  });
}
