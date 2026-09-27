import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { createMockSession } from './interview-fixtures';

/**
 * InterviewSetupPage - Preflight and session creation for technical boardroom simulation.
 * Strict compliance with backend session contract:
 * - Loads catalog via GET /api/v1/catalog
 * - Verifies profile eligibility (targetRole: "backend_developer")
 * - Creates session via POST /api/v1/sessions with body {}
 * - Navigates strictly to the persisted server ID: /app/interviews/:id
 */
export function InterviewSetupPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [creationError, setCreationError] = useState(null);
  const [isUsingFixtures, setIsUsingFixtures] = useState(false);

  // Fetch catalog on mount
  const fetchCatalog = async () => {
    setIsLoadingCatalog(true);
    setCatalogError(null);
    try {
      const response = await apiClient.get('/catalog');
      setCatalog(response.data);
      setIsUsingFixtures(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NETWORK_FAILURE') {
        // Backend is offline on port 4000
        setCatalogError({
          code: 'NETWORK_FAILURE',
          message: 'Unable to connect to PanelIQ Express backend (http://localhost:4000).',
          isOffline: true,
        });
      } else {
        setCatalogError({
          code: err.code || 'CATALOG_ERROR',
          message: err.message || 'Failed to load simulation catalog.',
          isOffline: false,
        });
      }
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Handle fallback to contract-backed dev mode if backend is unreachable
  const handleEnableDevMode = () => {
    setCatalog({
      domains: ['computer_science'],
      levels: ['junior', 'intermediate'],
      stages: ['icebreaker', 'technical', 'techno_managerial', 'reflection'],
      topics: ['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs'],
      roles: [{ slug: 'backend_developer', domain: 'computer_science', label: 'Backend Developer' }],
    });
    setIsUsingFixtures(true);
    setCatalogError(null);
  };

  // Launch interview
  const handleStartInterview = async () => {
    setIsCreatingSession(true);
    setCreationError(null);

    // Profile check
    if (!profile?.displayName || !profile?.targetRole) {
      setCreationError({
        code: 'PROFILE_INCOMPLETE',
        message: 'Your candidate profile requires a display name and target role before starting.',
        action: (
          <Link to="/onboarding">
            <Button size="sm" variant="secondary">
              Update Profile in Onboarding
            </Button>
          </Link>
        ),
      });
      setIsCreatingSession(false);
      return;
    }

    if (isUsingFixtures) {
      // Contract-backed dev session
      const mockSession = createMockSession(null, profile);
      // Persist in sessionStorage so page reload on /app/interviews/:id restores the session
      sessionStorage.setItem(`paneliq_mock_session_${mockSession.id}`, JSON.stringify(mockSession));
      navigate(`/app/interviews/${mockSession.id}`);
      return;
    }

    try {
      // Real backend contract: POST /api/v1/sessions with strict empty body {}
      const response = await apiClient.post('/sessions', {});
      const session = response.data?.session;

      if (!session?.id) {
        throw new Error('Server response did not include a valid session ID');
      }

      // Navigate to persisted server ID
      navigate(`/app/interviews/${session.id}`);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NETWORK_FAILURE') {
        setCreationError({
          code: 'NETWORK_FAILURE',
          message: 'Backend server is not running on port 4000. Start the backend or use contract fixture mode.',
          allowDevFallback: true,
        });
      } else {
        setCreationError({
          code: err.code || 'CREATION_FAILED',
          message: err.message || 'Could not initialize interview session. Please try again.',
        });
      }
      setIsCreatingSession(false);
    }
  };

  const selectedRole = catalog?.roles?.find((r) => r.slug === 'backend_developer') || {
    label: 'Backend Developer',
    domain: 'computer_science',
  };

  const candidateLevel = profile?.experienceLevel || 'junior';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        title="Setup Technical Boardroom Simulation"
        description="Configure your practice session. You will face a 3-member panel through 8 structured turns covering system architecture, concurrency, and trade-offs."
        actions={
          <Link to="/app">
            <Button variant="outline" size="sm">
              Cancel & Return to Dashboard
            </Button>
          </Link>
        }
      />

      {/* Contract fixture disclaimer banner if in dev mode */}
      {isUsingFixtures && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid rgba(158, 103, 30, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Badge variant="pending">Dev Mode: Contract Fixture</Badge>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Backend offline on port 4000. Running against seed question bank fixtures (PRD D2-01).
            </span>
          </div>
          <Button size="xs" variant="outline" onClick={fetchCatalog} leftIcon={<RefreshCw size={12} />}>
            Retry Live Connection
          </Button>
        </div>
      )}

      {/* Error state if catalog fetch failed and not using fixtures */}
      {catalogError && !isUsingFixtures && (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <ErrorState
            title="Backend Service Unreachable"
            message={catalogError.message}
            onRetry={fetchCatalog}
          />
          {catalogError.isOffline && (
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                You can explore and test the entire Dev 2 interview experience using verified contract seed fixtures.
              </div>
              <Button variant="secondary" size="sm" onClick={handleEnableDevMode}>
                Continue with Contract Fixtures
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoadingCatalog && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="140px" />
          <Skeleton height="200px" />
          <Skeleton height="80px" />
        </div>
      )}

      {/* Active Setup Form */}
      {!isLoadingCatalog && (!catalogError || isUsingFixtures) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Simulation Structure Card */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>
                  Simulation Specifications
                </h3>
              </div>
              <Badge variant="reviewed">Verified Bank Contract</Badge>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Target Track
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                  {selectedRole.label}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                  Domain: Computer Science
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Candidate Level
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', textTransform: 'capitalize', marginTop: '0.25rem' }}>
                  {candidateLevel}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                  Calibrated Difficulty: 1–3
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Session Length
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                  8 Fixed Turns (~25 min)
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                  Auto-persisted per turn
                </div>
              </div>
            </div>

            {/* Covered Topics */}
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Technical Topics Assessed in this Session:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(catalog?.topics || ['apis', 'databases', 'concurrency', 'reliability', 'project_tradeoffs']).map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-xs)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    #{t.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Explanation Card */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Interview Protocol & Boardroom Rules
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Shield size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-text-main)' }}>Text-Based Architecture Assessment:</strong> Responses are typed in a controlled editor (up to 2,000 characters). You can format architecture solutions clearly.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-success)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-text-main)' }}>Durable Answer Persistence:</strong> Every turn is submitted with an idempotency key and verified server version. You can safely exit and resume anytime without losing progress.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Layers size={16} style={{ color: 'var(--color-warning)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-text-main)' }}>Adaptive Constraint Turn:</strong> At turn 5, the panel will introduce a sudden operational constraint (e.g. concurrent race conditions or timeouts) to evaluate how your reasoning adapts.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Info size={16} style={{ color: 'var(--color-info)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-text-main)' }}>Detailed Assessment Notice:</strong> Detailed scoring rubrics and evidence extraction are generated upon completion. Initial reviews may show provisional or pending evaluator review states.
                </div>
              </div>
            </div>
          </div>

          {/* Creation Error Banner */}
          {creationError && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid rgba(184, 56, 56, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <AlertCircle size={16} />
                <span>Session Creation Error</span>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)' }}>{creationError.message}</div>
              {creationError.action && <div>{creationError.action}</div>}
              {creationError.allowDevFallback && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Button size="sm" variant="secondary" onClick={handleEnableDevMode}>
                    Switch to Contract Fixture Mode
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* CTA Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Candidate: <strong>{profile?.displayName || user?.email}</strong> • Role:{' '}
              <strong>{selectedRole.label}</strong>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleStartInterview}
              disabled={isCreatingSession}
              isLoading={isCreatingSession}
              rightIcon={<ArrowRight size={18} />}
            >
              {isCreatingSession ? 'Initializing Session...' : 'Enter Boardroom Simulation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
