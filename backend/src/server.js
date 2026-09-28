import { createApp } from './app.js';
import { env } from './config/env.js';

/**
 * Initializes and starts the HTTP server.
 */
function startServer() {
  try {
    const app = createApp();

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`PanelIQ backend running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`Health check: /api/v1/health (port ${env.PORT})`);
      console.log(`Allowed CORS origins: ${env.ALLOWED_ORIGINS.join(', ')}`);
    });

    server.on('error', (err) => {
      console.error('Server startup error:', err.message);
      process.exit(1);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

const server = startServer();

/**
 * Handles graceful shutdown on SIGINT/SIGTERM with a bounded timeout.
 */
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);

  // Force exit after 10-second timeout if connections fail to close
  const forceTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err.message);
      process.exit(1);
    }
    console.log('Server stopped cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
