import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  FileQuestion,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { Badge } from './Badge';

/**
 * AppShell - Primary layout for authenticated PanelIQ workspace
 * Handles responsive sidebar navigation, role-aware links, and dev mode account switcher.
 */
export function AppShell({ children }) {
  const { user, profile, role, signOut, devMode, setDevAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const candidateLinks = [
    { label: 'Dashboard', path: '/app', icon: <LayoutDashboard size={18} /> },
    { label: 'Settings', path: '/app/settings', icon: <Settings size={18} /> },
  ];

  const expertLinks = [
    { label: 'Expert Queue', path: '/expert', icon: <ShieldCheck size={18} /> },
    { label: 'Question Lab', path: '/expert/question-lab', icon: <FlaskConical size={18} /> },
  ];

  const adminLinks = [
    { label: 'Question Bank', path: '/admin/questions', icon: <FileQuestion size={18} /> },
    { label: 'Assignments', path: '/admin/assignments', icon: <Users size={18} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', overflowX: 'hidden' }}>
      {/* Top Bar */}
      <header
        style={{
          minHeight: '64px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '0.5rem',
              minHeight: '44px',
              minWidth: '44px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            className="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            to="/app"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--color-text-main)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              minHeight: '44px',
            }}
          >
            PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
          </Link>

          {/* Dev Mode Demo Account Switcher */}
          {devMode && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <Badge variant="accent" style={{ padding: '1px 5px', fontSize: '10px' }}>
                DEMO
              </Badge>
              <select
                value={role}
                onChange={(e) => setDevAccount(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: '1px 2px',
                  minHeight: '30px',
                }}
                aria-label="Switch demo role"
              >
                <option value="candidate">Candidate (Alex Chen)</option>
                <option value="evaluator">Evaluator (Dr. Sharma)</option>
                <option value="admin">Admin (System Admin)</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/"
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.375rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              minHeight: '36px',
            }}
            className="topbar-landing-link"
          >
            <span>Landing</span> <ExternalLink size={12} />
          </Link>

          {/* User profile capsule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ textAlign: 'right', display: 'none' }} className="topbar-user-info">
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {profile?.displayName || user?.email?.split('@')[0] || 'Candidate'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {role === 'admin' ? 'Administrator' : role === 'evaluator' ? 'Evaluator' : 'Candidate'}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-control)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                minHeight: '38px',
              }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} />
              <span className="signout-label">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        {/* Desktop Sidebar (240px wide as per PRD Section 8) */}
        <aside
          style={{
            width: '240px',
            backgroundColor: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
          className="desktop-sidebar"
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
                padding: '0 0.75rem 0.5rem',
              }}
            >
              Candidate Practice
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
              {candidateLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                      backgroundColor: isActive ? 'var(--color-surface-subtle)' : 'transparent',
                      border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)',
                      minHeight: '44px',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Expert Evaluator section */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
                padding: '0 0.75rem 0.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: '1rem',
              }}
            >
              Expert Evaluator
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
              {expertLinks.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                      backgroundColor: isActive ? 'var(--color-surface-subtle)' : 'transparent',
                      border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)',
                      minHeight: '44px',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Admin section */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
                padding: '0 0.75rem 0.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: '1rem',
              }}
            >
              Administration
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {adminLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                      backgroundColor: isActive ? 'var(--color-surface-subtle)' : 'transparent',
                      border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)',
                      minHeight: '44px',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <div>PanelIQ v1.1</div>
            <div style={{ marginTop: '0.25rem' }}>Text-first boardroom</div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'var(--color-surface)',
              zIndex: 35,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              overflowY: 'auto',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                CANDIDATE
              </div>
              {candidateLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: 'var(--font-size-base)',
                    color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-main)',
                    backgroundColor: location.pathname === item.path ? 'var(--color-surface-subtle)' : 'transparent',
                    minHeight: '44px',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '1rem', textTransform: 'uppercase' }}>
                EXPERT EVALUATOR
              </div>
              {expertLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: 'var(--font-size-base)',
                    color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-main)',
                    backgroundColor: location.pathname === item.path ? 'var(--color-surface-subtle)' : 'transparent',
                    minHeight: '44px',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '1rem', textTransform: 'uppercase' }}>
                ADMINISTRATION
              </div>
              {adminLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: 'var(--font-size-base)',
                    color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-main)',
                    backgroundColor: location.pathname === item.path ? 'var(--color-surface-subtle)' : 'transparent',
                    minHeight: '44px',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Content Region */}
        <main
          style={{
            flex: 1,
            padding: '1.5rem 1rem',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
          className="app-main-content"
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav-toggle {
            display: none !important;
          }
          .topbar-user-info {
            display: block !important;
          }
          .app-main-content {
            padding: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          .signout-label {
            display: none;
          }
          .topbar-landing-link {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AppShell;
