import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  HelpCircle,
  FastForward,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogFooter } from '../../components/ui/Dialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { PanelCard, normalizePanelRole } from './PanelCard';
import { StageRail } from './StageRail';
import { QuestionCard } from './QuestionCard';
import { AnswerComposer } from './AnswerComposer';
import { SaveIndicator } from './SaveIndicator';
import { ConstraintCard } from './ConstraintCard';
import {
  createMockSession,
  advanceMockSession,
  MOCK_SEED_QUESTIONS,
} from './interview-fixtures';

/**
 * Generates a stable UUID for idempotency keys
 */
function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'key_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
}

/**
 * Storage key generator for local unsent drafts
 */
function getDraftStorageKey(userId, sessionId, turnId) {
  return `paneliq_draft_${userId || 'anon'}_${sessionId}_${turnId || 'none'}`;
}

/**
 * InterviewRoomPage - The live text-based technical boardroom simulation room.
 * Strict adherence to PRD Sections 5, 7, 12, 14.3 (D2-01 through D2-08)
 * and backend session-contract.md.
 */
export function InterviewRoomPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Primary session state
  const [session, setSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [isUsingFixtures, setIsUsingFixtures] = useState(false);

  // Composer and turn submission state
  const [answerText, setAnswerText] = useState('');
  const [submissionState, setSubmissionState] = useState('idle'); // idle | submitting | saved | reconnecting | error
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const [saveIndicatorState, setSaveIndicatorState] = useState('idle');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null);

  // Stored answer history for constraint turns
  const [previousAnswers, setPreviousAnswers] = useState({});

  // Idempotency tracking (PRD Section 14.3 D2-04: reuse same key on retry of the same operation)
  const currentIdempotencyKeyRef = useRef(null);

  // Modals & UI states
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [staleVersionConflict, setStaleVersionConflict] = useState(null);

  // Fetch session on load and restore draft
  const fetchSession = useCallback(async () => {
    setIsLoadingSession(true);
    setSessionError(null);
    setStaleVersionConflict(null);

    // Check if we have a locally saved contract mock session
    const mockStorageKey = `paneliq_mock_session_${sessionId}`;
    const storedMock = sessionStorage.getItem(mockStorageKey);

    if (storedMock) {
      try {
        const parsed = JSON.parse(storedMock);
        setSession(parsed);
        setIsUsingFixtures(true);
        setIsLoadingSession(false);
        // Load draft for current turn
        if (parsed.currentTurn?.id) {
          const draft = sessionStorage.getItem(getDraftStorageKey(user?.id, sessionId, parsed.currentTurn.id));
          if (draft) {
            setAnswerText(draft);
            setSaveIndicatorState('draft_local');
          }
        }
        return;
      } catch {
        // Fall through to real API
      }
    }

    try {
      // Real backend contract: GET /api/v1/sessions/:id
      const response = await apiClient.get(`/sessions/${sessionId}`);
      const sessionData = response.data?.session;

      if (!sessionData) {
        throw new Error('Server returned an empty session payload');
      }

      setSession(sessionData);
      setIsUsingFixtures(false);

      // Load draft for current turn
      if (sessionData.currentTurn?.id) {
        const draft = sessionStorage.getItem(getDraftStorageKey(user?.id, sessionId, sessionData.currentTurn.id));
        if (draft) {
          setAnswerText(draft);
          setSaveIndicatorState('draft_local');
        }
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'NETWORK_FAILURE') {
        // Offer contract fixture fallback if backend is offline
        setSessionError({
          code: 'NETWORK_FAILURE',
          message: 'Unable to connect to PanelIQ Express backend (http://localhost:4000).',
          isOffline: true,
        });
      } else {
        setSessionError({
          code: err.code || 'SESSION_LOAD_FAILED',
          message: err.message || 'Failed to load interview session.',
          status: err.status,
          isOffline: false,
        });
      }
    } finally {
      setIsLoadingSession(false);
    }
  }, [sessionId, user?.id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Handle local text editing & keystroke draft saving to sessionStorage
  const handleAnswerChange = (newText) => {
    setAnswerText(newText);
    setSubmissionErrorMessage('');

    if (session?.currentTurn?.id) {
      const storageKey = getDraftStorageKey(user?.id, sessionId, session.currentTurn.id);
      if (newText.trim().length > 0) {
        sessionStorage.setItem(storageKey, newText);
        if (submissionState !== 'submitting') {
          setSaveIndicatorState('draft_unsaved');
        }
      } else {
        sessionStorage.removeItem(storageKey);
        setSaveIndicatorState('idle');
      }
    }
  };

  // Submit Answer with Idempotency Key & Version Check
  const handleSubmitAnswer = async () => {
    if (!session || !session.currentTurn) return;
    const currentTurn = session.currentTurn;

    if (!answerText.trim()) {
      setSubmissionErrorMessage('Please enter your response before submitting.');
      return;
    }

    if ([...answerText].length > 2000) {
      setSubmissionErrorMessage('Answer text exceeds the 2,000 character limit.');
      return;
    }

    // Reuse existing key if retrying a failed attempt; generate new key otherwise
    if (!currentIdempotencyKeyRef.current) {
      currentIdempotencyKeyRef.current = generateIdempotencyKey();
    }
    const idempotencyKey = currentIdempotencyKeyRef.current;

    setSubmissionState('submitting');
    setSaveIndicatorState('submitting');
    setSubmissionErrorMessage('');

    // Handle contract fixture simulation
    if (isUsingFixtures) {
      setTimeout(() => {
        // Record previous answer for constraint turn reference
        setPreviousAnswers((prev) => ({
          ...prev,
          [currentTurn.position]: answerText,
        }));

        // Advance mock session
        const nextSession = advanceMockSession(session, answerText, false);
        setSession(nextSession);
        sessionStorage.setItem(`paneliq_mock_session_${sessionId}`, JSON.stringify(nextSession));

        // Clear local draft and idempotency key
        sessionStorage.removeItem(getDraftStorageKey(user?.id, sessionId, currentTurn.id));
        currentIdempotencyKeyRef.current = null;
        setAnswerText('');

        // Indicate successful save
        setSubmissionState('saved');
        setSaveIndicatorState('saved');
        setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        setTimeout(() => {
          setSubmissionState('idle');
          setSaveIndicatorState('idle');
        }, 2000);
      }, 500);
      return;
    }

    try {
      // Real backend contract: POST /api/v1/sessions/:id/answers
      // Headers: Idempotency-Key: <uuid>
      // Body: { turnId, expectedSessionVersion, answerText }
      const response = await apiClient.post(
        `/sessions/${sessionId}/answers`,
        {
          turnId: currentTurn.id,
          expectedSessionVersion: session.version,
          answerText: answerText.trim(),
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      const updatedSession = response.data?.session;

      // Record answer text for potential constraint review
      setPreviousAnswers((prev) => ({
        ...prev,
        [currentTurn.position]: answerText,
      }));

      // Clear local draft and idempotency key
      sessionStorage.removeItem(getDraftStorageKey(user?.id, sessionId, currentTurn.id));
      currentIdempotencyKeyRef.current = null;
      setAnswerText('');

      // Update session with next turn
      if (updatedSession) {
        setSession(updatedSession);
      }

      setSubmissionState('saved');
      setSaveIndicatorState('saved');
      setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      setTimeout(() => {
        setSubmissionState('idle');
        setSaveIndicatorState('idle');
      }, 2000);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          // Version or idempotency conflict
          setSubmissionState('error');
          setSaveIndicatorState('stale_tab');
          setStaleVersionConflict({
            code: err.code,
            message: err.message || 'Session version changed. Please refresh to load the current turn.',
          });
        } else if (err.code === 'NETWORK_FAILURE') {
          // Network failure: preserve idempotency key and local draft
          setSubmissionState('reconnecting');
          setSaveIndicatorState('draft_local');
          setSubmissionErrorMessage('Network unavailable. Your draft is preserved on this device. Reconnect to retry.');
        } else {
          setSubmissionState('error');
          setSubmissionErrorMessage(err.message || 'Failed to submit response.');
        }
      } else {
        setSubmissionState('error');
        setSubmissionErrorMessage(err.message || 'An unexpected error occurred.');
      }
    }
  };

  // Explicit Skip Turn with Confirmation Modal
  const handleConfirmSkip = async () => {
    if (!session || !session.currentTurn) return;
    const currentTurn = session.currentTurn;
    const idempotencyKey = generateIdempotencyKey();

    setIsSkipDialogOpen(false);
    setSubmissionState('submitting');
    setSaveIndicatorState('submitting');
    setSubmissionErrorMessage('');

    if (isUsingFixtures) {
      setTimeout(() => {
        const nextSession = advanceMockSession(session, null, true);
        setSession(nextSession);
        sessionStorage.setItem(`paneliq_mock_session_${sessionId}`, JSON.stringify(nextSession));
        sessionStorage.removeItem(getDraftStorageKey(user?.id, sessionId, currentTurn.id));
        setAnswerText('');
        setSubmissionState('idle');
        setSaveIndicatorState('idle');
      }, 400);
      return;
    }

    try {
      // Real backend contract: POST /api/v1/sessions/:id/skip
      // Headers: Idempotency-Key: <uuid>
      // Body: { turnId, expectedSessionVersion, confirm: true }
      const response = await apiClient.post(
        `/sessions/${sessionId}/skip`,
        {
          turnId: currentTurn.id,
          expectedSessionVersion: session.version,
          confirm: true,
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      const updatedSession = response.data?.session;
      sessionStorage.removeItem(getDraftStorageKey(user?.id, sessionId, currentTurn.id));
      setAnswerText('');

      if (updatedSession) {
        setSession(updatedSession);
      }
      setSubmissionState('idle');
      setSaveIndicatorState('idle');
    } catch (err) {
      setSubmissionState('error');
      setSubmissionErrorMessage(err.message || 'Failed to skip turn. Please retry.');
    }
  };

  // Complete Interview and Hand Off to Dev 3 Report
  const handleCompleteInterview = async () => {
    if (!session) return;
    setIsCompleting(true);

    if (isUsingFixtures) {
      setTimeout(() => {
        const completedSession = {
          ...session,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
        sessionStorage.setItem(`paneliq_mock_session_${sessionId}`, JSON.stringify(completedSession));
        navigate(`/app/interviews/${sessionId}/report`);
      }, 500);
      return;
    }

    try {
      // Real backend contract: POST /api/v1/sessions/:id/complete
      // Body: { expectedSessionVersion: session.version }
      const response = await apiClient.post(`/sessions/${sessionId}/complete`, {
        expectedSessionVersion: session.version,
      });

      const finalSession = response.data?.session;
      if (finalSession) {
        setSession(finalSession);
      }

      // Navigate to Dev 3's report route
      navigate(`/app/interviews/${sessionId}/report`);
    } catch (err) {
      setIsCompleting(false);
      setSubmissionErrorMessage(err.message || 'Failed to complete session. Please retry.');
    }
  };

  // Switch to contract fixture mode if offline
  const handleEnableMockMode = () => {
    const mock = createMockSession(sessionId, profile);
    sessionStorage.setItem(`paneliq_mock_session_${sessionId}`, JSON.stringify(mock));
    setSession(mock);
    setIsUsingFixtures(true);
    setSessionError(null);
  };

  // Loading Skeleton
  if (isLoadingSession) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="70px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
        <Skeleton height="180px" />
        <Skeleton height="220px" />
      </div>
    );
  }

  // Error State
  if (sessionError) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <ErrorState
          title={sessionError.isOffline ? 'Backend Server Offline' : 'Session Unavailable'}
          message={sessionError.message}
          onRetry={fetchSession}
        />
        {sessionError.isOffline && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Explore the entire 8-turn interview simulation with verified contract fixtures.
            </div>
            <Button variant="secondary" size="sm" onClick={handleEnableMockMode}>
              Launch Contract Fixture Boardroom
            </Button>
          </div>
        )}
      </div>
    );
  }

  const currentTurn = session?.currentTurn;
  const isFinished = session?.status === 'completed' || (!currentTurn && session?.answeredCount >= session?.totalTurns);
  const activePanelRole = currentTurn?.panelRole || 'chair';
  const isConstraintTurn = Boolean(currentTurn?.constraint);

  return (
    <div
      style={{
        maxWidth: '1140px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Top Header Bar: Exit / Resume + Status + Save indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExitDialogOpen(true)}
            leftIcon={<ArrowLeft size={14} />}
          >
            Exit to Dashboard
          </Button>

          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
            PanelIQ Simulation Room
          </span>

          {isUsingFixtures && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-warning)',
                backgroundColor: 'var(--color-warning-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(158, 103, 30, 0.3)',
              }}
            >
              Dev Mode: Contract Fixture
            </span>
          )}
        </div>

        {/* Live Save Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SaveIndicator state={saveIndicatorState} lastSavedTime={lastSavedTimestamp} />
        </div>
      </div>

      {/* Stale Version Conflict Banner (409) */}
      {staleVersionConflict && (
        <div
          style={{
            padding: '1rem',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Session Version Conflict
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {staleVersionConflict.message} Your local draft has been kept in the composer.
              </div>
            </div>
          </div>
          <Button size="xs" variant="primary" onClick={fetchSession} leftIcon={<RefreshCw size={13} />}>
            Sync Current Turn
          </Button>
        </div>
      )}

      {/* Panel Row: 3 Simulated Boardroom Evaluators */}
      <section aria-label="Evaluation Panel" style={{ width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
          className="panel-cards-grid"
        >
          <PanelCard role="chair" isActive={normalizePanelRole(activePanelRole) === 'chair' && !isFinished} />
          <PanelCard role="specialist" isActive={normalizePanelRole(activePanelRole) === 'specialist' && !isFinished} />
          <PanelCard role="evaluator" isActive={normalizePanelRole(activePanelRole) === 'evaluator' && !isFinished} />
        </div>
      </section>

      {/* Stage Rail: 4 Stages + Timer */}
      <StageRail
        currentTurnPosition={currentTurn?.position || (isFinished ? 8 : session.answeredCount + 1)}
        totalTurns={session.totalTurns || 8}
        currentStage={currentTurn?.stage || 'reflection'}
        startTime={session.createdAt}
        isCompleted={isFinished}
      />

      {/* Main Workspace: Active Turn vs Completed State */}
      {!isFinished && currentTurn ? (
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Question / Scenario area */}
          {isConstraintTurn ? (
            <ConstraintCard
              originalPrompt={currentTurn.constraint?.originalPrompt}
              constraintChange={currentTurn.constraint?.change}
              followUpPrompt={currentTurn.constraint?.followUp || currentTurn.prompt}
              previousAnswer={previousAnswers[currentTurn.position - 1] || ''}
            />
          ) : (
            <QuestionCard
              prompt={currentTurn.prompt}
              stage={currentTurn.stage}
              panelRole={currentTurn.panelRole}
              topics={currentTurn.topics || []}
              difficulty={currentTurn.difficulty || 1}
              questionId={currentTurn.questionId}
            />
          )}

          {/* Reusable Answer Composer */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <AnswerComposer
              value={answerText}
              onChange={handleAnswerChange}
              onSubmit={handleSubmitAnswer}
              disabled={submissionState === 'submitting'}
              maxLength={2000}
              submissionState={submissionState}
              errorMessage={submissionErrorMessage}
              actionsSlot={
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsSkipDialogOpen(true)}
                  disabled={submissionState === 'submitting'}
                  leftIcon={<FastForward size={14} />}
                >
                  Skip Turn
                </Button>
              }
            />
          </div>
        </main>
      ) : (
        /* Completed / Ready to Finalize State */
        <div
          style={{
            padding: '2.5rem 1.5rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={28} />
          </div>

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--font-size-3xl)',
                color: 'var(--color-text-main)',
                margin: '0 0 0.5rem 0',
              }}
            >
              All 8 Boardroom Turns Completed
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                maxWidth: '540px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Your technical responses across the 4 stages have been securely persisted on the server. You can now finalize the session to generate your evidence-linked scorecard.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '0.5rem',
            }}
          >
            <Link to="/app">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>

            <Button
              variant="primary"
              size="lg"
              onClick={handleCompleteInterview}
              disabled={isCompleting}
              isLoading={isCompleting}
              rightIcon={<ExternalLink size={16} />}
            >
              {isCompleting ? 'Finalizing Evaluation...' : 'View Evidence Scorecard'}
            </Button>
          </div>
        </div>
      )}

      {/* Skip Turn Confirmation Dialog */}
      <Dialog
        isOpen={isSkipDialogOpen}
        onClose={() => setIsSkipDialogOpen(false)}
        title="Confirm Turn Skip"
        description="Are you sure you want to skip this prompt? Skipping will record an unsubmitted response for this turn, and the panel will advance to the next question."
      >
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-text-main)',
            fontSize: 'var(--font-size-xs)',
            lineHeight: 1.5,
            border: '1px solid rgba(158, 103, 30, 0.3)',
          }}
        >
          <strong>Evaluation Note:</strong> Skipped turns are marked as omitted in the scorecard rubric and cannot be undone once confirmed.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSkipDialogOpen(false)}>
            Resume Answering
          </Button>
          <Button variant="primary" onClick={handleConfirmSkip}>
            Confirm & Skip Turn
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Exit & Resume Confirmation Dialog */}
      <Dialog
        isOpen={isExitDialogOpen}
        onClose={() => setIsExitDialogOpen(false)}
        title="Exit Simulation Room"
        description="All submitted turns are permanently saved on the server. You can safely return to your candidate dashboard and resume this exact turn anytime."
      >
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Your current unsent draft text will remain stored on this device until you return.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsExitDialogOpen(false)}>
            Stay in Interview
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsExitDialogOpen(false);
              navigate('/app');
            }}
          >
            Save & Exit to Dashboard
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
