import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

/**
 * Honest placeholder for Dev 2 and Dev 3 route slots.
 * Preserves navigation integrity without infringing on teammate ownership boundaries.
 */
export function PlaceholderRoute({
  owner = 'Dev 2',
  featureName = 'Interview Experience',
  routePath = '/app/interviews',
  notes = 'Awaiting teammate prompt execution.',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <Badge variant="provisional">
            ROUTE SLOT RESERVED FOR {owner.toUpperCase()}
          </Badge>
        </div>

        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            marginBottom: '0.75rem',
          }}
        >
          {featureName}
        </h1>

        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            marginBottom: '1rem',
          }}
        >
          Route: {routePath}
        </div>

        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          This route slot is strictly reserved for {owner} per PRD Section 14. Dev 1 has exported all shared design tokens, AppShell, Button/Input/Dialog primitives, and the API helper for import. No substitute page has been built.
        </p>

        <Link to="/app">
          <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
            Return to Candidate Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default PlaceholderRoute;
