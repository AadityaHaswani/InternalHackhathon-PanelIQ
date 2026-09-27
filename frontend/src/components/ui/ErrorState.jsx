import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Reusable ErrorState component with requestId display and retry action.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  code,
  requestId,
  onRetry,
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid rgba(184, 56, 56, 0.25)',
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--color-error)',
          marginBottom: '1rem',
          padding: '0.875rem',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-error-bg)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.375rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '460px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {message}
      </p>

      {(code || requestId) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {code && <span>Code: {code}</span>}
          {code && requestId && <span>•</span>}
          {requestId && <span>Ref: {requestId.substring(0, 12)}...</span>}
        </div>
      )}

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
