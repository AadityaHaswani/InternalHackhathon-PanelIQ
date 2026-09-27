import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FastForward,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';

export function InterviewReplayPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [replay, setReplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryingAnswerId, setRetryingAnswerId] = useState(null);

  const ROLE_LABELS = {
    backend_developer: 'Backend Developer',
    frontend_engineer: 'Frontend Engineer',
    fullstack_engineer: 'Full Stack Engineer',
    system_design_engineer: 'System Design Engineer',
    devops_cloud_engineer: 'DevOps / Cloud Engineer',
    data_engineer: 'Data Engineer',
    qa_automation_engineer: 'QA / Automation Engineer',
  };

  const formatRole = (r) => (r ? (ROLE_LABELS[r] || r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())) : 'Technical');

  const fetchReplay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setReplay(null);

    try {
      // Backend contract: GET /api/v1/sessions/:id/replay
      const response = await apiClient.get(`sessions/${sessionId}/replay`);
      setReplay(response.data);
    } catch (err) {
      setError({
        code: err.code || 'REPLAY_LOAD_ERROR',
        message: err.message || 'Failed to load interview replay transcript.',
        requestId: err.requestId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchReplay();
  }, [fetchReplay]);

  // Handler for spawning a targeted skill retry
  const handleLaunchRetry = async (answerId) => {
    if (!answerId) return;
    setRetryingAnswerId(answerId);

    try {
      // Backend contract: POST /api/v1/sessions/:id/answers/:answerId/retry
      const response = await apiClient.post(`sessions/${sessionId}/answers/${answerId}/retry`, {});
      const retryRecord = response.data?.retry;

      if (!retryRecord?.id) {
        throw new Error('Retry record did not contain a valid ID');
      }

      toast.success('Question variant loaded. Opening retry sandbox...');
      navigate(`/app/retries/${retryRecord.id}`);
    } catch (err) {
      if (err.code === 'RETRY_NOT_AVAILABLE') {
        toast.info('No approved question variant exists for this turn yet.');
      } else {
        toast.error(err.message || 'Unable to initiate retry attempt.');
      }
    } finally {
      setRetryingAnswerId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" />
        <Skeleton height="100px" />
        <Skeleton height="220px" />
        <Skeleton height="220px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <ErrorState
          title="Unable to load interview transcript"
          message={error.message}
          code={error.code}
          requestId={error.requestId}
          onRetry={fetchReplay}
        />
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/app">
            <Button variant="outline" leftIcon={<ArrowLeft size={14} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const transcript = replay?.transcript || [];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to={`/app/interviews/${sessionId}/report`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Scorecard
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/app">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title={`${formatRole(replay?.profile?.targetRole)} Interview Replay & Answer Log`}
        description="Immutable record of questions presented by the panel and your submitted technical answers."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {sessionId.substring(0, 8)}...
            </span>
            <Badge variant={replay?.status === 'completed' ? 'reviewed' : 'pending'}>
              {replay?.status === 'completed' ? 'Completed Session' : 'Active Session'}
            </Badge>
          </div>
        }
      />

      {/* Session Metadata Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div>
          Role: <strong>{replay?.profile?.targetRole === 'backend_developer' ? 'Backend Developer' : (replay?.profile?.targetRole || 'Backend Developer')}</strong> • Level: <strong style={{ textTransform: 'capitalize' }}>{replay?.profile?.experienceLevel || 'Junior'}</strong>
        </div>
        <div>
          Total Turns Recorded: <strong>{transcript.length} / 8</strong>
        </div>
        {replay?.completedAt && (
          <div>
            Completed: <strong>{new Date(replay.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
        )}
      </div>

      {/* Turn by turn transcript timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {transcript.map((item, index) => {
          const isSkipped = item.answer?.state === 'skipped';
          const hasAnswer = Boolean(item.answer?.answerText);
          const isScoredStage = item.stage === 'technical' || item.stage === 'techno_managerial';

          return (
            <div
              key={item.turnId || index}
              style={{
                borderRadius: 'var(--radius-card)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              {/* Turn header */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-main)' }}>
                    Turn {item.position} of {replay.totalTurns || 8}
                  </span>
                  <Badge variant="outline" style={{ textTransform: 'capitalize' }}>
                    {item.stage?.replace('_', ' ')}
                  </Badge>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    Panel: {item.panelRole || 'chair'}
                  </span>
                  {item.isChallenge && (
                    <Badge variant="accent">
                      Adaptive Constraint
                    </Badge>
                  )}
                </div>

                {/* State indicator */}
                <div>
                  {isSkipped ? (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                      <FastForward size={14} /> Skipped Turn
                    </span>
                  ) : hasAnswer ? (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                      <CheckCircle2 size={14} /> Answer Submitted
                    </span>
                  ) : (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      No record
                    </span>
                  )}
                </div>
              </div>

              {/* Turn content */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Question Prompt */}
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Panel Question
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--color-text-main)',
                      lineHeight: 1.6,
                    }}
                  >
                    "{item.prompt}"
                  </div>
                </div>

                {/* Constraint Details if challenge turn */}
                {item.constraint && (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderLeft: '3px solid var(--color-warning)',
                      fontSize: 'var(--font-size-xs)',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                      Operational Constraint Introduced:
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      {item.constraint.change}
                    </div>
                  </div>
                )}

                {/* Candidate Answer Box */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Your Response
                    </span>
                    {item.answer?.submittedAt && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {new Date(item.answer.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {hasAnswer ? (
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-surface-subtle)',
                        border: '1px solid var(--color-border-subtle)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-main)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {item.answer.answerText}
                    </div>
                  ) : isSkipped ? (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-surface-subtle)',
                        border: '1px dashed var(--color-border)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      No answer was submitted for this turn (turn explicitly skipped by candidate).
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-surface-subtle)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Turn uncompleted.
                    </div>
                  )}
                </div>

                {/* Retry action for technical answers */}
                {isScoredStage && item.answer?.id && hasAnswer && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={retryingAnswerId === item.answer.id}
                      onClick={() => handleLaunchRetry(item.answer.id)}
                      leftIcon={<RotateCcw size={14} />}
                    >
                      Practice Variant Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewReplayPage;
