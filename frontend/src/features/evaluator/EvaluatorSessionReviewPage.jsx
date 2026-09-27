import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Edit3,
  Award,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';

export function EvaluatorSessionReviewPage() {
  const { id: sessionId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [reportData, setReportData] = useState(null);
  const [replayData, setReplayData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Override form state per evaluation: { [evalId]: { newRating: number, reason: string, isSubmitting: boolean } }
  const [overrideForms, setOverrideForms] = useState({});

  // Release report form state
  const [releaseSummary, setReleaseSummary] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load report data (staff view) and replay transcript in parallel
      const [reportRes, replayRes] = await Promise.all([
        apiClient.get(`sessions/${sessionId}/report`),
        apiClient.get(`sessions/${sessionId}/replay`),
      ]);

      setReportData(reportRes.data);
      setReplayData(replayRes.data);
    } catch (err) {
      setError({
        code: err.code || 'REVIEW_DATA_ERROR',
        message: err.message || 'Failed to load session review data.',
        requestId: err.requestId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle applying a human score override
  const handleApplyOverride = async (evaluationId) => {
    const form = overrideForms[evaluationId];
    if (!form || form.newRating === undefined || form.newRating === null) {
      toast.error('Please select a rating for the override.');
      return;
    }
    if (!form.reason || !form.reason.trim()) {
      toast.error('A justification reason is required for an expert override.');
      return;
    }

    setOverrideForms((prev) => ({
      ...prev,
      [evaluationId]: { ...prev[evaluationId], isSubmitting: true },
    }));

    try {
      // Backend contract: POST /api/v1/evaluations/:id/overrides
      await apiClient.post(`evaluations/${evaluationId}/overrides`, {
        newRating: Number(form.newRating),
        reason: form.reason.trim(),
      });

      toast.success('Review override recorded in append-only audit trail.');
      // Refresh report data to reflect updated rating and session score
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save review override.');
    } finally {
      setOverrideForms((prev) => ({
        ...prev,
        [evaluationId]: { ...prev[evaluationId], isSubmitting: false },
      }));
    }
  };

  // Handle releasing the official report
  const handleReleaseReport = async (e) => {
    e.preventDefault();
    setIsReleasing(true);
    setReleaseError(null);

    try {
      // Backend contract: POST /api/v1/sessions/:id/release
      await apiClient.post(`sessions/${sessionId}/release`, {
        summary: releaseSummary.trim() || undefined,
      });

      toast.success('Report successfully released and locked for candidate view.');
      await fetchData();
    } catch (err) {
      if (err.code === 'SCORING_PENDING') {
        setReleaseError('Cannot release report: all required technical criteria must have complete ratings.');
      } else {
        setReleaseError(err.message || 'Failed to release report.');
      }
      toast.error(err.message || 'Release failed.');
    } finally {
      setIsReleasing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" />
        <Skeleton height="140px" />
        <Skeleton height="260px" />
        <Skeleton height="260px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <ErrorState
          title="Review Session Unavailable"
          message={error.message}
          code={error.code}
          requestId={error.requestId}
          onRetry={fetchData}
        />
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/expert">
            <Button variant="outline" leftIcon={<ArrowLeft size={14} />}>
              Back to Evaluator Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isReleased = reportData?.reportStatus === 'released';
  const transcript = replayData?.transcript || [];
  const evaluations = reportData?.evaluations || [];
  const overrides = reportData?.reviewOverrides || [];

  // Group evaluations by turnId
  const evalsByTurn = {};
  for (const ev of evaluations) {
    if (!evalsByTurn[ev.turn_id]) evalsByTurn[ev.turn_id] = [];
    evalsByTurn[ev.turn_id].push(ev);
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top back navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/expert" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Review Queue
        </Link>

        <Badge variant={isReleased ? 'reviewed' : 'pending'}>
          {isReleased ? `Released (Revision ${reportData.currentRevision || 1})` : 'Draft Evaluation (Unreleased)'}
        </Badge>
      </div>

      <PageHeader
        title="Evaluator Score Verification & Overrides"
        description="Inspect candidate answers against automated proposals, apply justified score overrides, and release the official scorecard."
      />

      {/* Session Summary Card */}
      <div
        style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Session ID
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
            {sessionId}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Composite Score
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
            {reportData?.overallScore !== null && reportData?.overallScore !== undefined ? `${Math.round(reportData.overallScore)} / 100` : '-- / 100'}
            {reportData?.isProvisional && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)', marginLeft: '0.5rem', fontWeight: 500 }}>
                (Provisional)
              </span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Criteria Status
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
            {reportData?.evaluatedCount || 0} / {reportData?.requiredCount || 24} criteria rated
          </div>
        </div>
      </div>

      {/* Turn by turn inspector with evaluations & overrides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
          Boardroom Turns & Evaluation Criteria
        </h2>

        {transcript.map((item) => {
          const turnEvals = evalsByTurn[item.turnId] || [];
          const hasAnswer = Boolean(item.answer?.answerText);

          return (
            <div
              key={item.turnId}
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
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                    Turn {item.position}
                  </span>
                  <Badge variant="outline" style={{ textTransform: 'capitalize' }}>
                    {item.stage?.replace('_', ' ')}
                  </Badge>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Role: {item.panelRole}
                  </span>
                </div>

                <span style={{ fontSize: 'var(--font-size-xs)', color: hasAnswer ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {hasAnswer ? 'Response Submitted' : 'Skipped / Empty'}
                </span>
              </div>

              {/* Turn body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Question Prompt
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--font-size-base)', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                    "{item.prompt}"
                  </div>
                </div>

                {/* Candidate Answer */}
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Candidate Answer
                  </div>
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: 1.6,
                      color: 'var(--color-text-main)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.answer?.answerText || '(No answer text provided)'}
                  </div>
                </div>

                {/* Criteria Evaluations */}
                {turnEvals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                      Evaluation Criteria & Evidence
                    </div>

                    {turnEvals.map((ev) => {
                      const form = overrideForms[ev.id] || {
                        newRating: ev.rating !== null ? ev.rating : 3,
                        reason: '',
                      };

                      return (
                        <div
                          key={ev.id}
                          style={{
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-main)', textTransform: 'capitalize' }}>
                              Criterion: {ev.criterion_id}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                Rating:
                              </span>
                              <Badge variant={ev.rating >= 3 ? 'reviewed' : ev.rating >= 2 ? 'pending' : 'draft'}>
                                {ev.rating !== null ? `${ev.rating} / 4` : 'Pending'}
                              </Badge>
                            </div>
                          </div>

                          {/* Evidence Excerpt */}
                          {ev.evidence_excerpt && (
                            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-subtle)', borderLeft: '2px solid var(--color-primary)', fontSize: 'var(--font-size-xs)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                Verified Evidence Excerpt (Offset {ev.evidence_start}–{ev.evidence_end}):
                              </div>
                              <span style={{ fontStyle: 'italic', color: 'var(--color-text-main)' }}>
                                "{ev.evidence_excerpt}"
                              </span>
                            </div>
                          )}

                          {/* Rationale */}
                          {ev.rationale && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                              <strong>Panel Rationale:</strong> {ev.rationale}
                            </div>
                          )}

                          {/* Override Form */}
                          {!isReleased && (
                            <div
                              style={{
                                marginTop: '0.5rem',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid var(--color-border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                              }}
                            >
                              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                                Apply Expert Rating Override
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                                <Select
                                  options={[
                                    { value: 0, label: '0 — Deficient' },
                                    { value: 1, label: '1 — Developing' },
                                    { value: 2, label: '2 — Competent' },
                                    { value: 3, label: '3 — Strong' },
                                    { value: 4, label: '4 — Exemplary' },
                                  ]}
                                  value={form.newRating}
                                  onChange={(e) =>
                                    setOverrideForms((prev) => ({
                                      ...prev,
                                      [ev.id]: { ...form, newRating: Number(e.target.value) },
                                    }))
                                  }
                                  style={{ marginBottom: 0 }}
                                />

                                <input
                                  type="text"
                                  placeholder="Required justification rationale..."
                                  value={form.reason}
                                  onChange={(e) =>
                                    setOverrideForms((prev) => ({
                                      ...prev,
                                      [ev.id]: { ...form, reason: e.target.value },
                                    }))
                                  }
                                  style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-control)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-main)',
                                    backgroundColor: 'var(--color-surface)',
                                  }}
                                />

                                <Button
                                  size="sm"
                                  variant="secondary"
                                  isLoading={form.isSubmitting}
                                  onClick={() => handleApplyOverride(ev.id)}
                                >
                                  Save Override
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    {item.stage === 'icebreaker' || item.stage === 'reflection'
                      ? 'Icebreaker and reflection stages are qualitative and excluded from composite rubric scoring.'
                      : 'Evaluations for this turn are being processed by the background engine.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Release Section */}
      <div
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
            Release Official Evaluation Report
          </h2>
        </div>

        {isReleased ? (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <CheckCircle2 size={20} />
            <div>
              <strong>Official Report Revision Released:</strong> This report has been finalized and published to the candidate. Subsequent evaluation writes are blocked to preserve immutable audit records.
            </div>
          </div>
        ) : (
          <form onSubmit={handleReleaseReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Releasing the report locks the scorecard and makes the verified scores and feedback available to the candidate. All required criteria must be rated prior to release.
            </p>

            <textarea
              rows={3}
              placeholder="Optional executive feedback summary for the candidate (e.g., 'Demonstrates solid architectural principles around idempotency; recommend sharpening distributed deadlock recovery')..."
              value={releaseSummary}
              onChange={(e) => setReleaseSummary(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />

            {releaseError && (
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
                <span>{releaseError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isReleasing}
                disabled={isReleasing}
                leftIcon={<FileCheck size={16} />}
              >
                {isReleasing ? 'Publishing Revision...' : 'Release Official Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EvaluatorSessionReviewPage;
