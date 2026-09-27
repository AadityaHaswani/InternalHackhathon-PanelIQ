import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';

function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'retry_key_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
}

export function TargetedRetryPage() {
  const { id: retryId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [retry, setRetry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const idempotencyKeyRef = useRef(null);

  const fetchRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Backend contract: GET /api/v1/retries/:retryId
      const response = await apiClient.get(`retries/${retryId}`);
      setRetry(response.data?.retry);
    } catch (err) {
      setError({
        code: err.code || 'RETRY_LOAD_ERROR',
        message: err.message || 'Failed to load retry attempt.',
        requestId: err.requestId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [retryId]);

  useEffect(() => {
    fetchRetry();
  }, [fetchRetry]);

  const handleSubmitRetryAnswer = async (e) => {
    e.preventDefault();
    const trimmed = answerText.trim();
    if (!trimmed) {
      setSubmitError('Please enter your response before submitting.');
      return;
    }
    if ([...trimmed].length > 2000) {
      setSubmitError('Answer text exceeds the 2,000 character limit.');
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateIdempotencyKey();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Backend contract: POST /api/v1/retries/:retryId/answer
      const response = await apiClient.post(`retries/${retryId}/answer`, {
        answerText: trimmed,
        idempotencyKey: idempotencyKeyRef.current,
      });

      const updated = response.data?.retry;
      if (updated) {
        setRetry(updated);
      }
      toast.success('Retry evaluated by panel criteria!');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit retry answer.');
      toast.error(err.message || 'Evaluation failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" />
        <Skeleton height="180px" />
        <Skeleton height="260px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <ErrorState
          title="Retry Attempt Not Found"
          message={error.message}
          code={error.code}
          requestId={error.requestId}
          onRetry={fetchRetry}
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

  const isEvaluated = retry?.status === 'evaluated';

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top back navigation */}
      <div>
        <Link
          to={retry?.sessionId ? `/app/interviews/${retry.sessionId}/replay` : '/app'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Back to Interview Replay
        </Link>
      </div>

      <PageHeader
        title="Targeted Skill Retry"
        description="Strengthen your architectural reasoning by answering an approved comparable variant without altering your original session answers."
        actions={
          <Badge variant={isEvaluated ? 'reviewed' : 'pending'}>
            {isEvaluated ? 'Evaluated' : 'Attempt Active'}
          </Badge>
        }
      />

      {/* Target Skill Context Banner */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
            Domain Dimension
          </div>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)' }}>
            #{retry.topic?.replace('_', ' ')}
          </div>
        </div>

        {retry.skillTested && (
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Target Capability
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {retry.skillTested}
            </div>
          </div>
        )}

        {retry.originalScore !== null && retry.originalScore !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Original Turn Score
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {Math.round(retry.originalScore)} / 100
            </div>
          </div>
        )}
      </div>

      {/* Variant Question Card */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
            Comparable Question Variant
          </h2>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-main)',
            lineHeight: 1.6,
            padding: '1.25rem',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-control)',
            borderLeft: '3px solid var(--color-primary)',
          }}
        >
          "{retry.variantPrompt || 'Explain how you would handle this scenario under high concurrency.'}"
        </div>
      </div>

      {/* Evaluated Outcome Card if already evaluated */}
      {isEvaluated ? (
        <div
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--color-success)" />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
              Retry Evaluation Result
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Original Answer Score
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                {retry.originalScore !== null ? Math.round(retry.originalScore) : '--'} / 100
              </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Retry Answer Score
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.25rem' }}>
                {retry.retryScore !== null ? Math.round(retry.retryScore) : '--'} / 100
              </div>
            </div>

            {retry.numericComparisonAllowed && retry.scoreDelta !== null && (
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Score Delta
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                    color: retry.scoreDelta >= 0 ? 'var(--color-success)' : 'var(--color-warning)',
                    marginTop: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <TrendingUp size={20} />
                  {retry.scoreDelta >= 0 ? `+${Math.round(retry.scoreDelta)}` : Math.round(retry.scoreDelta)}
                </div>
              </div>
            )}
          </div>

          {retry.comparisonNote && (
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-subtle)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              <strong>Rubric Note:</strong> {retry.comparisonNote}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to={`/app/interviews/${retry.sessionId}/replay`}>
              <Button variant="outline">Back to Replay</Button>
            </Link>
            <Link to="/app">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Answer Input Form for Active Retry */
        <form
          onSubmit={handleSubmitRetryAnswer}
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label
              htmlFor="retry-answer-input"
              style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}
            >
              Compose Your Response
            </label>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {[...answerText].length} / 2,000 characters
            </span>
          </div>

          <textarea
            id="retry-answer-input"
            rows={8}
            placeholder="Type your architectural response here. Be specific about constraints, edge cases, and concrete tradeoffs..."
            value={answerText}
            onChange={(e) => {
              setAnswerText(e.target.value);
              setSubmitError(null);
            }}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.6,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />

          {submitError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{submitError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Evaluated strictly against published 0–4 rubric anchors.
            </span>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting || !answerText.trim()}
              leftIcon={<RotateCcw size={16} />}
            >
              {isSubmitting ? 'Evaluating Response...' : 'Submit Retry Answer'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TargetedRetryPage;
