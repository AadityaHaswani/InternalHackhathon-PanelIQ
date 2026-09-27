import React from 'react';
import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '3rem 1.25rem 2.5rem',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--color-text-main)',
            textDecoration: 'none',
          }}
        >
          PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
        </Link>

        <div
          style={{
            display: 'flex',
            gap: '1.75rem',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/#how-it-works" style={{ transition: 'color var(--transition-fast)' }}>
            How it works
          </Link>
          <Link to="/candidates" style={{ transition: 'color var(--transition-fast)' }}>
            For candidates
          </Link>
          <Link to="/evaluators" style={{ transition: 'color var(--transition-fast)' }}>
            For evaluators
          </Link>
          <Link to="/app" style={{ transition: 'color var(--transition-fast)' }}>
            Dashboard
          </Link>
          <Link to="/auth?tab=signin" style={{ transition: 'color var(--transition-fast)' }}>
            Sign in
          </Link>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '1.5rem auto 0',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}
      >
        <p style={{ maxWidth: '820px' }}>
          PanelIQ is a prototype for simulation, coaching, and human decision support. It does not establish that AI can objectively determine job suitability. No automatic hiring/rejection decision is in scope.
        </p>
        <div>
          © {new Date().getFullYear()} PanelIQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
