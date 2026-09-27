import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../lib/auth-context';

export function PublicNavbar({ ctaText, ctaAction }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, devMode, setDevAccount } = useAuth();

  const handleStartPractice = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  const handleRoleSignIn = (roleKey) => {
    if (devMode) {
      setDevAccount(roleKey);
      navigate(roleKey === 'admin' ? '/admin/questions' : (roleKey === 'evaluator' ? '/expert' : '/app'));
    } else {
      navigate('/auth?tab=signin');
    }
  };

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#how-it-works');
    }
  };

  const isCandidatesActive = location.pathname === '/candidates';
  const isEvaluatorsActive = location.pathname === '/evaluators';

  // Default CTA based on page
  const defaultCtaAction = isEvaluatorsActive
    ? () => handleRoleSignIn('evaluator')
    : handleStartPractice;
  const defaultCtaText = isEvaluatorsActive
    ? 'Evaluator sign in'
    : 'Start practice';

  const onCtaClick = ctaAction || defaultCtaAction;
  const displayCtaText = ctaText || defaultCtaText;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--color-text-main)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          style={{ display: 'none', gap: '2.25rem', alignItems: 'center' }}
          aria-label="Main public navigation"
        >
          <a
            href="/#how-it-works"
            onClick={handleHowItWorksClick}
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
              cursor: 'pointer',
            }}
            className="public-nav-link"
          >
            How it works
          </a>

          <Link
            to="/candidates"
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: isCandidatesActive ? 700 : 500,
              color: isCandidatesActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: isCandidatesActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all var(--transition-fast)',
            }}
            className="public-nav-link"
          >
            For candidates
          </Link>

          <Link
            to="/evaluators"
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: isEvaluatorsActive ? 700 : 500,
              color: isEvaluatorsActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: isEvaluatorsActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all var(--transition-fast)',
            }}
            className="public-nav-link"
          >
            For evaluators
          </Link>
        </nav>

        {/* Header Right Action (Desktop) */}
        <div className="desktop-actions" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <Link to="/app">
              <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={onCtaClick} rightIcon={<ArrowRight size={16} />}>
              {displayCtaText}
            </Button>
          )}
        </div>

        {/* Mobile Menu Hamburger Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            color: 'var(--color-text-main)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Collapsible Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
            maxHeight: 'calc(100vh - 70px)',
            overflowY: 'auto',
          }}
        >
          <a
            href="/#how-it-works"
            onClick={handleHowItWorksClick}
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text-main)',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            How it works
          </a>

          <Link
            to="/candidates"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: isCandidatesActive ? 700 : 500,
              color: isCandidatesActive ? 'var(--color-primary)' : 'var(--color-text-main)',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            For candidates
          </Link>

          <Link
            to="/evaluators"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: isEvaluatorsActive ? 700 : 500,
              color: isEvaluatorsActive ? 'var(--color-primary)' : 'var(--color-text-main)',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            For evaluators
          </Link>

          <div style={{ paddingTop: '0.5rem' }}>
            {user ? (
              <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} rightIcon={<ArrowRight size={16} />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onCtaClick();
                }}
                style={{ width: '100%', justifyContent: 'center' }}
                rightIcon={<ArrowRight size={16} />}
              >
                {displayCtaText}
              </Button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
        .public-nav-link:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </header>
  );
}

export default PublicNavbar;
