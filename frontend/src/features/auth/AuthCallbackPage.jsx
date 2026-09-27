import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui/Button';

export function AuthCallbackPage() {
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    async function handleAuth() {
      // Check query/hash for error descriptions
      const hash = location.hash || location.search;
      if (hash.includes('error=') || hash.includes('error_description=')) {
        setStatus('error');
        if (hash.includes('expired') || hash.includes('invalid')) {
          setErrorMessage('The confirmation or reset link has expired or is invalid. Please request a new link.');
        } else {
          setErrorMessage('Authentication link could not be verified.');
        }
        return;
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) {
            setStatus('success');
            await refreshProfile();
            setTimeout(() => {
              navigate('/app');
            }, 1000);
          } else {
            setStatus('success');
            setTimeout(() => navigate('/auth'), 1200);
          }
        } catch (err) {
          setStatus('error');
          setErrorMessage(err.message || 'Session recovery failed');
        }
      } else {
        // Dev mode simulation
        setStatus('success');
        setTimeout(() => navigate('/app'), 1000);
      }
    }

    handleAuth();
  }, [location, navigate, refreshProfile]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {status === 'processing' && (
          <div>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--color-border)',
                borderRightColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1.5rem',
              }}
              aria-hidden="true"
            />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Verifying session...
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Completing secure authentication handshake.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                color: 'var(--color-success)',
                marginBottom: '1rem',
                display: 'inline-flex',
                padding: '0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-success-bg)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Session confirmed
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Redirecting to your workspace...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                color: 'var(--color-error)',
                marginBottom: '1rem',
                display: 'inline-flex',
                padding: '0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-error-bg)',
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Link expired or invalid
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {errorMessage}
            </p>
            <Link to="/auth">
              <Button variant="primary" style={{ width: '100%' }}>
                Request new link
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallbackPage;
