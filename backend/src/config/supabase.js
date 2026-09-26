import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Auth has no dedicated timeout option in this SDK. Its supported global.fetch
// hook lets Node abort both the request and response body after eight seconds.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (url, options = {}) => {
      const timeout = AbortSignal.timeout(8000);
      const signal = options.signal
        ? AbortSignal.any([options.signal, timeout])
        : timeout;
      return fetch(url, { ...options, signal });
    },
  },
});

// Always pass each request's token explicitly. Never sign in on this client.
export function verifyAccessToken(accessToken) {
  return supabase.auth.getUser(accessToken);
}
