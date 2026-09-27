import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Target,
  Sparkles,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnswerComposer } from '../interview/AnswerComposer';
import { ComparisonCard } from './ComparisonCard';
import { getSessionReport, submitAnswerRetry } from '../reports/services/assessmentApi';

/**
 * RetryPage - Targeted Skill Remediation & Second Attempt
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 * Route: /app/retries/:id
 */
export function RetryPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const turnParam = parseInt(searchParams.get('turn') || '5', 10);

  const [report, setReport] = useState(null);
  const [targetTurn, setTargetTurn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retry state
  const [revisedText, setRevisedText] = useState('');
  const [submissionState, setSubmissionState] = useState('idle');
  const [retryResult, setRetryResult] = useState(null);
  const [composerError, setComposerError] = useState('');

  const fetchSessionData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessionReport(id);
      if (!data) throw new Error('Session report not found.');
      setReport(data);

      const turns = data.turns || [];
      const found = turns.find((t) => t.turnPosition === turnParam) || turns.find((t) => t.eligibleForRetry) || turns[0];
      setTargetTurn(found);

      if (found) {
        setRevisedText('');
      }
    } catch (err) {
      console.error('Failed to load session for retry:', err);
      setError(err.message || 'Unable to load retry scenario.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [id, turnParam]);

  const handleRetrySubmit = async () => {
    if (!revisedText.trim()) {
      setComposerError('Please articulate your revised answer before submitting.');
      return;
    }
    setComposerError('');
    setSubmissionState('submitting');

    try {
      const result = await submitAnswerRetry(targetTurn?.questionId || `ans_${turnParam}`, {
        revisedAnswer: revisedText,
        targetSkill: targetTurn?.targetSkill || 'Idempotent Payment Handling & Retry Deduplication',
        originalScore: targetTurn?.score || 2.3,
        questionId: targetTurn?.questionId,
      });

      setRetryResult(result);
      setSubmissionState('saved');
    } catch (err) {
      console.error('Failed to submit retry:', err);
      setComposerError(err.message || 'Failed to submit retry attempt. Please try again.');
      setSubmissionState('error');
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="2.5rem" width="35%" borderRadius="8px" />
        <Skeleton height="8rem" borderRadius="14px" />
        <Skeleton height="16rem" borderRadius="14px" />
        <Skeleton height="14rem" borderRadius="14px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <ErrorState
          title="Could Not Load Targeted Retry"
          message={error}
          onRetry={fetchSessionData}
        />
      </div>
    );
  }

  if (!targetTurn) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <EmptyState
          icon={<FileText size={40} />}
          title="No Target Turn Selected"
          description="We could not find an unmastered skill turn eligible for retry in this session."
          action={
            <Link to={`/app/interviews/${id}/report`}>
              <Button variant="primary">Return to Report</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const targetSkill = targetTurn.targetSkill || 'Idempotent Payment Handling & Retry Deduplication';
  const comparableQuestion =
    targetTurn.questionId === 'be-j-concurrency-constraint'
      ? 'An external payment provider took 8 seconds to reply, causing a mobile app to send two identical retry POST /orders requests concurrently. How do you design the database schema and application transaction boundary using Idempotency Keys so that the customer is never double-charged, and both requests receive the authoritative order ID?'
      : `Based on your earlier discussion on ${targetSkill}, explain how you would guarantee correctness and zero duplicate execution under concurrent client retries.`;

  return (
    <div
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-muted, #8C857B)' }}>
        <Link to={`/app/interviews/${id}/report`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted, #8C857B)' }}>
          <ArrowLeft size={14} />
          <span>Back to Scorecard Report</span>
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>Targeted Skill Retry</span>
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Targeted Skill Retry — Turn #{targetTurn.turnPosition}
            </h1>
            <Badge variant="accent">
              <RotateCcw size={12} style={{ marginRight: '4px' }} />
              Second Attempt
            </Badge>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '0.375rem', margin: 0 }}>
            Remediate identified skill gaps under the exact same calibrated rubric. The original interview score remains permanent and immutable.
          </p>
        </div>

        <Link to={`/app/interviews/${id}/report`}>
          <Button variant="secondary" size="sm">
            View Scorecard Report
          </Button>
        </Link>
      </div>

      {/* Strict Immutability Guarantee Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border, #E5DFD6)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
        }}
      >
        <ShieldCheck size={22} color="var(--color-success, #2D7252)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--color-text-main, #1A1816)' }}>Immutability Guarantee:</strong> Your initial interview turn scored{' '}
          <strong style={{ color: 'var(--color-error, #B83838)' }}>{targetTurn.score.toFixed(1)} / 4.0</strong>. This retry is evaluated as a separate, supplementary attempt to verify learning progression and does not overwrite your original recorded boardroom session.
        </div>
      </div>

      {/* Original Question vs Prior Answer Context */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border, #E5DFD6)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--color-primary, #B85042)" />
            <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)' }}>
              Original Scenario & Previous Identified Gaps
            </span>
          </div>

          <Badge variant="danger">
            Previous Score: {targetTurn.score.toFixed(1)} / 4.0
          </Badge>
        </div>

        {/* Original Prompt */}
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
            Original Boardroom Question
          </div>
          <p style={{ fontSize: '14px', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-text-main, #1A1816)', margin: 0, lineHeight: 1.5 }}>
            {targetTurn.prompt}
          </p>
        </div>

        {/* Prior Answer */}
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
            Your Previous Answer
          </div>
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--color-bg, #FAF7F2)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-subtle, #EFECE6)',
              fontSize: '13px',
              color: 'var(--color-text-secondary, #5E5953)',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            "{targetTurn.candidateAnswer}"
          </div>
        </div>

        {/* Gaps to address */}
        {targetTurn.evidence?.missingPoints && (
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: '#FAF2E6',
              border: '1px solid rgba(158, 103, 30, 0.25)',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-warning, #9E671E)' }}>
              Target Focus To Remediate:
            </span>
            <ul style={{ margin: '0.375rem 0 0 0', paddingLeft: '1.25rem', fontSize: '13px', color: 'var(--color-text-main, #1A1816)', lineHeight: 1.5 }}>
              {targetTurn.evidence.missingPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Target Comparable Question & Answer Composer */}
      {!retryResult ? (
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Comparable New Question */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={16} color="var(--color-primary, #B85042)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary, #B85042)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Comparable Calibrated Challenge
              </span>
            </div>

            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-bg, #FAF7F2)',
                borderRadius: '8px',
                border: '1px solid rgba(184, 80, 66, 0.2)',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                lineHeight: 1.6,
              }}
            >
              {comparableQuestion}
            </div>
          </div>

          {/* Controlled Answer Composer (Dev 2 Reused Component!) */}
          <AnswerComposer
            value={revisedText}
            onChange={setRevisedText}
            onSubmit={handleRetrySubmit}
            disabled={submissionState === 'submitting'}
            maxLength={2000}
            submissionState={submissionState}
            placeholder="Articulate your revised solution: include Idempotency-Key headers, Redis/Postgres uniqueness constraints, transaction rollback handling, and the HTTP status codes returned on retries..."
            errorMessage={composerError}
          />
        </div>
      ) : (
        /* Post-Submission Comparison Card */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'dev3FadeIn 0.3s ease forwards' }}>
          <ComparisonCard retryResult={retryResult} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setRetryResult(null);
                setSubmissionState('idle');
                setRevisedText('');
              }}
              leftIcon={<RotateCcw size={15} />}
            >
              Try Another Revision
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/app/interviews/${id}/report`)}
            >
              Return to Scorecard Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RetryPage;
