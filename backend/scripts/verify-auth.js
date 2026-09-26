import { env } from '../src/config/env.js';
import { supabase } from '../src/config/supabase.js';

// This process has its own client; it never signs in on the running API client.
// Credentials come only from ignored .env or the local process environment.
const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;

function report(passed, status, matched) {
  console.log(`${passed ? 'PASS' : 'FAIL'} status=${status} expectedUserMatched=${matched}`);
  if (!passed) process.exitCode = 1;
}

if (!email || !password) {
  report(false, 'not-run', false);
} else {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      report(false, error?.status ?? 'unavailable', false);
    } else {
      const response = await fetch(`http://127.0.0.1:${env.PORT}/api/v1/me`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        signal: AbortSignal.timeout(12000),
      });
      const body = await response.json();
      const matched = body.data?.user?.id === data.user.id &&
        body.data?.user?.email === (data.user.email ?? null);
      report(response.status === 200 && matched, response.status, matched);
    }
  } catch {
    report(false, 'unavailable', false);
  }
}
