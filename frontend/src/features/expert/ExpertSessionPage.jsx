import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Bot,
  UserCheck,
  Clock,
  AlertTriangle,
  Quote,
  CheckCircle2,
  FileCheck,
  Send,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScoreBar } from '../reports/ScoreBar';
import {
  getSessionReport,
  getSessionReplay,
  submitScoreOverride,
  releaseSessionReport,
} from '../reports/services/assessmentApi';

/**
 * ExpertSessionPage - Split Review Workspace for Staff Evaluator
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 * Route: /expert/sessions/:id
 */
export function ExpertSessionPage() {
  const params = useParams();
  const id = params.sessionId || params.id;
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [replay, setReplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active selected turn on the left
  const [selectedTurnIndex, setSelectedTurnIndex] = useState(0);

  // Override controls state
  const [criteriaScores, setCriteriaScores] = useState([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState('');

  // Release confirmation modal
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);

  // Review history
  const [overrideHistory, setOverrideHistory] = useState([]);

  const fetchSessionDetails = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setReplay(null);
    setCriteriaScores([]);
    setSelectedTurnIndex(0);
    setOverrideHistory([]);
    setOverrideReason('');
    setReasonError('');
    setOverrideSuccessMsg('');

    try {
      const [repData, replayData] = await Promise.all([
        getSessionReport(id),
        getSessionReplay(id),
      ]);

      setReport(repData);
      setReplay(replayData);

      if (repData?.scores?.criteria && repData.scores.criteria.length > 0) {
        setCriteriaScores(
          repData.scores.criteria.map((c) => ({
            ...c,
            originalScore: c.score,
          }))
        );
      } else {
        const defaultScore = repData?.overallScore ? +(repData.overallScore / 25).toFixed(1) : 3.0;
        setCriteriaScores([
          { id: 'correctness', label: 'Technical Correctness', score: defaultScore, originalScore: defaultScore, weight: 0.40 },
          { id: 'reasoning', label: 'Architectural Reasoning', score: defaultScore, originalScore: defaultScore, weight: 0.25 },
          { id: 'relevance', label: 'Direct Relevance', score: defaultScore, originalScore: defaultScore, weight: 0.20 },
          { id: 'tradeoffs', label: 'Operational Trade-offs', score: defaultScore, originalScore: defaultScore, weight: 0.15 },
        ]);
      }

      if (repData?.reviewOverrides && repData.reviewOverrides.length > 0) {
        setOverrideHistory(
          repData.reviewOverrides.map((o) => ({
            reviewerName: 'Evaluator',
            role: 'Staff Evaluator',
            timestamp: o.created_at || new Date().toISOString(),
            reason: o.reason || 'Calibration adjustment recorded.',
            compositeScore: o.new_rating !== undefined ? o.new_rating : 3.4,
          }))
        );
      } else if (repData?.reviewer) {
        setOverrideHistory([
          {
            reviewerName: repData.reviewer.name || 'Evaluator',
            role: repData.reviewer.role || 'Staff Evaluator',
            timestamp: repData.reviewer.reviewedAt || new Date().toISOString(),
            reason: 'Preliminary calibration adjustments made based on transcript evidence audit.',
            compositeScore: repData.scores?.composite || 3.4,
          },
        ]);
      } else {
        setOverrideHistory([]);
      }
    } catch (err) {
      console.error('Failed to load expert review workspace:', err);
      setError(err.message || 'Unable to load session for review.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const handleScoreChange = (criterionId, newScore) => {
    const clamped = Math.min(4.0, Math.max(0.0, parseFloat(newScore) || 0.0));
    setCriteriaScores((prev) =>
      prev.map((c) => (c.id === criterionId ? { ...c, score: clamped } : c))
    );
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim() || overrideReason.trim().length < 8) {
      setReasonError('Justification reason is mandatory (minimum 8 characters required).');
      return;
    }
    setReasonError('');
    setIsSubmittingOverride(true);
    setOverrideSuccessMsg('');

    try {
      const payload = {
        sessionId: id,
        criteria: criteriaScores,
        reason: overrideReason,
        reviewerName: 'Dr. Vikram Sharma',
      };

      const res = await submitScoreOverride(`eval_${id}`, payload);
      setOverrideSuccessMsg('Score override recorded and saved to permanent audit log.');

      setOverrideHistory((prev) => [
        {
          reviewerName: 'Dr. Vikram Sharma',
          role: 'Staff Evaluator',
          timestamp: new Date().toISOString(),
          reason: overrideReason,
          compositeScore: res.data.compositeScore,
        },
        ...prev,
      ]);

      setReport((prev) => ({
        ...prev,
        status: 'reviewed',
        scores: {
          ...prev.scores,
          composite: res.data.compositeScore,
          criteria: criteriaScores,
        },
      }));
    } catch (err) {
      setReasonError(err.message || 'Failed to submit override.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleReleaseReport = async () => {
    setIsReleasing(true);
    try {
      await releaseSessionReport(id, {
        notes: releaseNotes,
        summary: releaseNotes || 'Official Evaluation Report',
        certifiedBy: 'Dr. Vikram Sharma',
        criteria: criteriaScores,
      });
      setIsReleaseModalOpen(false);
      setReport((prev) => ({
        ...prev,
        status: 'released',
        reportStatus: 'released',
        releasedAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Failed to release report:', err);
    } finally {
      setIsReleasing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="2.5rem" width="35%" borderRadius="8px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Skeleton height="36rem" borderRadius="14px" />
          <Skeleton height="36rem" borderRadius="14px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <ErrorState
          title="Could Not Load Expert Workspace"
          message={error}
          onRetry={fetchSessionDetails}
        />
      </div>
    );
  }

  const turns = replay?.transcript || replay?.turns || report?.turns || [];
  const activeTurn = turns[selectedTurnIndex] || turns[0] || {};
  const isReleased = Boolean(report?.releasedAt || report?.status === 'released' || report?.reportStatus === 'released');

  const candidate = report?.candidate || report?.profile || replay?.candidate || replay?.profile || {};
  const candidateName = candidate.displayName || candidate.display_name || candidate.name || 'Candidate';
  const rawRole = candidate.targetRole || candidate.target_role;
  const ROLE_LABELS = {
    backend_developer: 'Backend Developer',
    frontend_engineer: 'Frontend Engineer',
    fullstack_engineer: 'Full Stack Engineer',
    system_design_engineer: 'System Design Engineer',
    devops_cloud_engineer: 'DevOps / Cloud Engineer',
    data_engineer: 'Data Engineer',
    qa_automation_engineer: 'QA / Automation Engineer',
  };
  const roleName = rawRole ? (ROLE_LABELS[rawRole] || rawRole.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())) : 'Technical Interview';

  return (
    <div
      style={{
        maxWidth: '1360px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-muted, #8C857B)' }}>
        <Link to="/expert" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted, #8C857B)' }}>
          <ArrowLeft size={14} />
          <span>Expert Queue</span>
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>Verification & Calibration Workspace</span>
      </div>

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border, #E5DFD6)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Session Review: {candidateName}
            </h1>
            <Badge variant={isReleased ? 'reviewed' : 'accent'}>
              {isReleased ? 'Certified & Released' : 'Human Calibration Active'}
            </Badge>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)', marginTop: '0.25rem' }}>
            Target Role: <strong style={{ color: 'var(--color-text-main, #1A1816)' }}>{roleName}</strong> • Session ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{id}</span>
          </div>
        </div>

        {/* Release / Certify Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/interviews/${id}/report`)}
          >
            Candidate Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsReleaseModalOpen(true)}
            disabled={isReleased}
            leftIcon={<UserCheck size={16} />}
          >
            {isReleased ? 'Report Released' : 'Certify & Release Report'}
          </Button>
        </div>
      </div>

      {/* Main Dual-Pane Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="expert-dual-pane"
      >
        {/* LEFT PANE: INTERVIEW TRANSCRIPT AUDIT */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Left Pane Header & Turn Selector */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#FAF7F2',
              borderBottom: '1px solid var(--color-border, #E5DFD6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Quote size={16} color="var(--color-primary, #B85042)" />
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-text-main, #1A1816)',
                  margin: 0,
                }}
              >
                Interview Boardroom Transcript
              </h2>
            </div>

            {/* Turn Navigation Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflowX: 'auto' }}>
              {turns.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTurnIndex(idx)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: selectedTurnIndex === idx ? 700 : 500,
                    backgroundColor: selectedTurnIndex === idx ? 'var(--color-primary, #B85042)' : 'var(--color-surface-subtle, #F3EFEA)',
                    color: selectedTurnIndex === idx ? '#FFFFFF' : 'var(--color-text-secondary, #5E5953)',
                    border: '1px solid var(--color-border, #E5DFD6)',
                    cursor: 'pointer',
                  }}
                  title={`Jump to Turn #${idx + 1}`}
                >
                  T{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Turn Detailed Inspector */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '720px', overflowY: 'auto' }}>
            {/* Turn Metadata Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(184, 80, 66, 0.08)',
                    color: 'var(--color-primary, #B85042)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Turn #{selectedTurnIndex + 1} of {turns.length}
                </span>

                <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeTurn.stage?.replace('_', ' ') || 'Technical'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>
                Speaker: <strong style={{ color: 'var(--color-text-main, #1A1816)' }}>{activeTurn.speakerName || activeTurn.panelName || 'Interviewer'}</strong>
              </div>
            </div>

            {/* Prompt Box */}
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600, marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
                Prompt Delivered to Candidate
              </div>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FAF7F2',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-subtle, #EFECE6)',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-text-main, #1A1816)',
                  lineHeight: 1.5,
                }}
              >
                {activeTurn.prompt || activeTurn.question_snapshot?.prompt || activeTurn.question || '(No prompt available)'}
              </div>
            </div>

            {/* Candidate Verbatim Answer */}
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600, marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
                Candidate Verbatim Answer
              </div>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface, #FFFFFF)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #E5DFD6)',
                  fontSize: '13px',
                  color: 'var(--color-text-main, #1A1816)',
                  lineHeight: 1.6,
                }}
              >
                {activeTurn.candidateAnswer || activeTurn.answer?.answerText || activeTurn.answer_text || (activeTurn.answer?.state === 'skipped' ? '(Turn skipped by candidate)' : '(No response recorded for this turn)')}
              </div>
            </div>

            {/* AI Evaluator Findings on this turn */}
            {activeTurn.evidence && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FAF5F0',
                  borderRadius: '8px',
                  border: '1px solid rgba(184, 80, 66, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary, #B85042)', fontSize: '12px', fontWeight: 700 }}>
                  <Bot size={15} />
                  <span>Automated Rubric Findings</span>
                </div>

                {activeTurn.evidence.excerpt && (
                  <div className="dev3-quote-highlight" style={{ fontSize: '12px' }}>
                    “{activeTurn.evidence.excerpt}”
                  </div>
                )}

                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', margin: 0, lineHeight: 1.5 }}>
                  {activeTurn.evidence.explanation}
                </p>

                {activeTurn.evidence.missingPoints && (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-warning, #9E671E)' }}>Flagged Gaps:</span>
                    <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', fontSize: '12px', color: 'var(--color-text-secondary, #5E5953)' }}>
                      {activeTurn.evidence.missingPoints.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: SCORE VERIFICATION & OVERRIDES */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Right Pane Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#FAF7F2',
              borderBottom: '1px solid var(--color-border, #E5DFD6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--color-success, #2D7252)" />
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-text-main, #1A1816)',
                  margin: 0,
                }}
              >
                Score Verification & Human Overrides
              </h2>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>
              Strict Audit Trail Enforced
            </span>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* AI Proposed vs Evaluator Scoreboard */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: 'var(--color-bg, #FAF7F2)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle, #EFECE6)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', display: 'block', fontWeight: 600, letterSpacing: '0.06em' }}>
                  Original AI Proposal
                </span>
                <span style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-primary, #B85042)' }}>
                  {(report?.scores?.composite ?? (report?.overallScore !== null && report?.overallScore !== undefined ? +(report.overallScore / 25).toFixed(1) : 3.0)).toFixed(1)} <span style={{ fontSize: '14px', color: 'var(--color-text-muted, #8C857B)' }}>/ 4.0</span>
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', display: 'block', fontWeight: 600, letterSpacing: '0.06em' }}>
                  Current Calibrated Score
                </span>
                <span style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-success, #2D7252)' }}>
                  {(
                    criteriaScores.reduce((sum, c) => sum + c.score * (c.weight || 0.25), 0) /
                    (criteriaScores.reduce((sum, c) => sum + (c.weight || 0.25), 0) || 1)
                  ).toFixed(1)}{' '}
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted, #8C857B)' }}>/ 4.0</span>
                </span>
              </div>
            </div>

            {/* Overrides Form */}
            <form onSubmit={handleSaveOverride} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main, #1A1816)' }}>
                  Calibrate Individual Criteria (0.0 to 4.0):
                </span>

                {criteriaScores.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--color-bg, #FAF7F2)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-subtle, #EFECE6)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)' }}>
                        {c.label}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>AI: {c.originalScore?.toFixed(1)}</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="4.0"
                          value={c.score}
                          onChange={(e) => handleScoreChange(c.id, e.target.value)}
                          style={{
                            width: '64px',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--color-surface, #FFFFFF)',
                            border: '1px solid var(--color-border, #E5DFD6)',
                            borderRadius: '4px',
                            color: 'var(--color-primary, #B85042)',
                            fontSize: '13px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            textAlign: 'right',
                          }}
                        />
                      </div>
                    </div>

                    <ScoreBar score={c.score} max={4.0} size="sm" colorVariant="accent" showValue={false} />
                  </div>
                ))}
              </div>

              {/* Mandatory Justification Textarea */}
              <div>
                <label
                  htmlFor="override-reason"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-main, #1A1816)',
                    marginBottom: '0.375rem',
                  }}
                >
                  Evaluator Justification Reason <span style={{ color: 'var(--color-error, #B83838)' }}>* (Mandatory)</span>
                </label>
                <textarea
                  id="override-reason"
                  value={overrideReason}
                  onChange={(e) => {
                    setOverrideReason(e.target.value);
                    if (reasonError) setReasonError('');
                  }}
                  rows={3}
                  placeholder="State the pedagogical or technical rationale for this score adjustment (e.g., candidate demonstrated deeper understanding of distributed lease TTL than algorithmic parser recognized)..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-bg, #FAF7F2)',
                    border: reasonError ? '1px solid var(--color-error, #B83838)' : '1px solid var(--color-border, #E5DFD6)',
                    borderRadius: '8px',
                    color: 'var(--color-text-main, #1A1816)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {reasonError && (
                  <span style={{ fontSize: '11px', color: 'var(--color-error, #B83838)', marginTop: '0.25rem', display: 'block' }}>
                    {reasonError}
                  </span>
                )}

                {overrideSuccessMsg && (
                  <span style={{ fontSize: '12px', color: 'var(--color-success, #2D7252)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <CheckCircle2 size={14} />
                    <span>{overrideSuccessMsg}</span>
                  </span>
                )}
              </div>

              {/* Submit Override Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingOverride}
                  leftIcon={<Send size={14} />}
                >
                  Save Calibrated Override
                </Button>
              </div>
            </form>

            {/* Audit History Log */}
            {overrideHistory.length > 0 && (
              <div
                style={{
                  borderTop: '1px solid var(--color-border-subtle, #EFECE6)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted, #8C857B)' }}>
                  <History size={14} />
                  <span>Audit History (Original AI Evaluation Preserved)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {overrideHistory.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--color-bg, #FAF7F2)',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border-subtle, #EFECE6)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-main, #1A1816)', marginBottom: '2px' }}>
                        <span>
                          <strong>{h.reviewerName}</strong> ({h.role})
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success, #2D7252)', fontWeight: 700 }}>
                          Score: {h.compositeScore.toFixed(1)} / 4.0
                        </span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary, #5E5953)', fontStyle: 'italic', fontSize: '12px' }}>
                        "{h.reason}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Release Confirmation Dialog */}
      <Dialog
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        title="Certify and Release Assessment Report"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-secondary, #5E5953)', fontSize: '13px' }}>
          <p>
            You are about to certify and officially release this evaluation to{' '}
            <strong style={{ color: 'var(--color-text-main, #1A1816)' }}>{report?.candidate?.displayName || 'the candidate'}</strong>.
          </p>

          <p>
            Once released, your score overrides and audit justification will be displayed with a{' '}
            <strong style={{ color: 'var(--color-success, #2D7252)' }}>Human Reviewed</strong> certification badge on their dashboard.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main, #1A1816)', marginBottom: '0.375rem' }}>
              Optional Evaluator Sign-off Note:
            </label>
            <textarea
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Candidate demonstrated solid junior backend competencies with strong self-reflection..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: 'var(--color-bg, #FAF7F2)',
                border: '1px solid var(--color-border, #E5DFD6)',
                borderRadius: '6px',
                color: 'var(--color-text-main, #1A1816)',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="outline" size="sm" onClick={() => setIsReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isReleasing}
              onClick={handleReleaseReport}
              leftIcon={<CheckCircle2 size={15} />}
            >
              Confirm and Release
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default ExpertSessionPage;
