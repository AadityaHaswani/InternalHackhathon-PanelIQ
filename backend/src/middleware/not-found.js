/**
 * Middleware returning JSON 404 response for unhandled routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      retryable: false,
    },
    requestId: req.id || 'unknown',
  });
}
