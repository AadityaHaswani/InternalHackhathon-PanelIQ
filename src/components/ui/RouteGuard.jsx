import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

/**
 * RouteGuard to protect authenticated routes
 */
export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton height="2.5rem" width="40%" borderRadius="var(--radius-sm)" style={{ marginBottom: '1rem' }} />
        <Skeleton height="1.25rem" width="70%" style={{ marginBottom: '2rem' }} />
        <Skeleton height="12rem" borderRadius="var(--radius-card)" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Role-aware guard for admin routes
 */
export function RequireRole({ allowedRoles = ['admin'], children }) {
  const { role, user, isLoading, devMode, setDevAccount } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton height="2.5rem" width="40%" borderRadius="var(--radius-sm)" style={{ marginBottom: '1rem' }} />
        <Skeleton height="12rem" borderRadius="var(--radius-card)" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasRole = allowedRoles.includes(role);

  if (!hasRole) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            marginBottom: '1.5rem',
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.75rem' }}>
          403 — Administrator Access Required
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            maxWidth: '520px',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          This area is restricted to approved administrators. Your current session ({user.email}) is signed in as <strong>{role}</strong>. Frontend route guards are advisory; backend authorization remains authoritative.
        </p>

        {devMode && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Development helper:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDevAccount('admin')}
            >
              Switch to Admin demo account
            </Button>
          </div>
        )}

        <Link to="/app">
          <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
            Return to Candidate Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return children;
}
