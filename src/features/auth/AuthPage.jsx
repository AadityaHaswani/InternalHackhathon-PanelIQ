import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const { signIn, signUp, resetPassword, devMode, setDevAccount, isSupabaseConfigured } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (showResetForm) {
        await resetPassword(email);
        setResetSent(true);
        toast.success('Password reset link sent to your email.');
      } else if (activeTab === 'signin') {
        await signIn({ email, password });
        toast.success('Signed in successfully.');
        navigate('/app');
      } else {
        await signUp({ email, password });
        if (isSupabaseConfigured) {
          toast.info('Account created. Please check your inbox to confirm your email.');
        } else {
          toast.success('Demo account created! Proceeding to onboarding.');
          navigate('/onboarding');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (err.message?.includes('Invalid login credentials')) {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.message?.includes('Email not confirmed')) {
        msg = 'Your email address has not been confirmed yet. Please verify your inbox.';
      }
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    setDevAccount(roleKey);
    toast.info(`Switched to demo ${roleKey} account`);
    navigate(roleKey === 'admin' ? '/admin/questions' : '/app');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Brand header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link
          to="/"
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--color-text-main)',
            textDecoration: 'none',
          }}
        >
          PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
        </Link>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Selector-Applicant Simulation Platform
        </p>
      </div>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {!showResetForm ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
              <Tabs
                tabs={[
                  { id: 'signin', label: 'Sign in' },
                  { id: 'signup', label: 'Create account' },
                ]}
                activeTab={activeTab}
                onChange={(id) => {
                  setActiveTab(id);
                  setAuthError(null);
                  setSearchParams({ tab: id });
                }}
              />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Email address"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={activeTab === 'signup' ? 'Minimum 6 characters' : undefined}
              />

              {activeTab === 'signin' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(true);
                      setAuthError(null);
                    }}
                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {authError && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: 'var(--color-error-bg)',
                    border: '1px solid rgba(184, 56, 56, 0.2)',
                    color: 'var(--color-error)',
                    fontSize: 'var(--font-size-xs)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{authError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {activeTab === 'signin' ? 'Sign in to workspace' : 'Create candidate account'}
              </Button>
            </form>
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Reset password
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Enter your account email address and we'll send a link to recover your credentials.
            </p>

            {resetSent ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid rgba(45, 114, 82, 0.2)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <CheckCircle2 size={20} />
                <span>Recovery email sent. Check your inbox for instructions.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {authError && (
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--color-error-bg)',
                      color: 'var(--color-error)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    {authError}
                  </div>
                )}

                <Button type="submit" variant="primary" isLoading={isSubmitting} style={{ width: '100%' }}>
                  Send reset link
                </Button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setResetSent(false);
                setAuthError(null);
              }}
              style={{
                marginTop: '1.5rem',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                margin: '1.5rem auto 0',
              }}
            >
              <ArrowLeft size={14} /> Back to sign in
            </button>
          </div>
        )}

        {/* Development Quick Role Switcher */}
        {devMode && (
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Quick Demo Accounts (Local Dev)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button size="sm" variant="secondary" onClick={() => handleQuickDemo('candidate')}>
                Candidate
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleQuickDemo('evaluator')}>
                Evaluator
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleQuickDemo('admin')}>
                Admin
              </Button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={14} /> Return to landing page
        </Link>
      </div>
    </div>
  );
}

export default AuthPage;
