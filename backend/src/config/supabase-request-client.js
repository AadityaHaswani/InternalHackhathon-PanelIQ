import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Fresh for each verified request. Never reuse this client across users.
export function createRequestClient(accessToken) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: { timeout: 8000, retry: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
