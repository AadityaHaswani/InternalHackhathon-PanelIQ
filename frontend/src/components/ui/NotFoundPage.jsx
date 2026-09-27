import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from './Button';

/**
 * 404 Catch-All NotFoundPage matching editorial visual direction
 */
export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(3rem, 10vw, 4.5rem)',
            fontWeight: 800,
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-serif)',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            marginBottom: '0.75rem',
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          The requested page does not exist or has been moved. If you were looking for an active interview session, check your candidate dashboard.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/app">
            <Button variant="primary" leftIcon={<Home size={16} />}>
              Candidate Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
              Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
