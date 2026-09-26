import { randomUUID } from 'node:crypto';

/**
 * Assigns a request ID to req.id and sets the X-Request-Id response header.
 * Reuses incoming X-Request-Id header if present, otherwise generates a UUID v4.
 */
export function requestIdMiddleware(req, res, next) {
  const incomingId = req.header('x-request-id');
  const id = incomingId && incomingId.trim().length > 0 ? incomingId.trim() : randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
