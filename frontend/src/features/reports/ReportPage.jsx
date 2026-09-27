import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Clock,
  PlayCircle,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
  Quote,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  FileText,
  User,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScoreBar } from './ScoreBar';
import { EvaluationStatus } from './EvaluationStatus';
import { EvidenceDrawer } from './EvidenceDrawer';
import { RubricTable } from './RubricTable';
import { CoverageChart } from './CoverageChart';
import { QuestionQualityCard } from './QuestionQualityCard';
import { getSessionReport } from './services/assessmentApi';

/**
 * ReportPage - Evidence-Based Candidate Scorecard & Assessment Report
 * Styled with warm cream surfaces, terracotta primary actions, and elegant serif headings.
 * Route: /app/interviews/:id/report
 */
export function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('candidate');
  const [showRubricDetails, setShowRubricDetails] = useState(false);
  const [expandedTurns, setExpandedTurns] = useState({});
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessionReport(id);
      if (!data) {
        throw new Error('Report data not found for this session.');
      }
      setReport(data);
      if (data.turns && data.turns.length > 0) {
        setExpandedTurns({
          [data.turns[0].turnPosition]: true,
          [data.turns[1]?.turnPosition]: true,
        });
      }
    } catch (err) {
      console.error('Failed to load session report:', err);
      setError(err.message || 'Unable to load evaluation report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setReport(null);
    fetchReport();
  }, [id]);

  const toggleTurn = (turnPos) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [turnPos]: !prev[turnPos],
    }));
  };

  const openEvidence = (turn) => {
    setSelectedEvidence({
      turnPosition: turn.turnPosition,
      questionPrompt: turn.prompt,
      evidence: {
        ...turn.evidence,
        source: turn.source,
      },
    });
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton height="2.5rem" width="45%" borderRadius="8px" />
          <Skeleton height="2.5rem" width="25%" borderRadius="8px" />
        </div>
        <Skeleton height="5rem" borderRadius="10px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="18rem" borderRadius="14px" />
          <Skeleton height="18rem" borderRadius="14px" />
        </div>
        <Skeleton height="22rem" borderRadius="14px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <ErrorState
          title="Could Not Load Evaluation Report"
          message={error}
          onRetry={fetchReport}
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <EmptyState
          icon={<FileText size={40} />}
          title="No Report Available"
          description="This interview session does not have a completed or provisional report yet."
          action={
            <Link to="/app">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isPending = report.status === 'pending';
  const scores = report.scores || {};
  const criteria = scores.criteria || [];
  const candidate = report.candidate || {};
  const interview = report.interview || {};
  const turns = report.turns || [];

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-muted, #8C857B)' }}>
        <Link to="/app" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted, #8C857B)' }}>
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-secondary, #5E5953)' }}>Interviews</span>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>Scorecard Report</span>
      </div>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {candidate.displayName || 'Candidate'} — {candidate.targetRole || report.profile?.targetRole || 'Technical Interview'}
            </h1>
            <Badge variant="accent" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
              {candidate.experienceLevel || 'Junior'} Band
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '0.5rem',
              fontSize: '13px',
              color: 'var(--color-text-muted, #8C857B)',
            }}
          >
            <span>Session ID: <strong style={{ color: 'var(--color-text-secondary, #5E5953)', fontFamily: 'var(--font-mono)' }}>{id}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={13} /> {interview.durationMinutes || 30} mins
            </span>
            <span>•</span>
            <span>{interview.mode || 'Boardroom Simulation'}</span>
            <span>•</span>
            <span>{new Date(interview.completedAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/interviews/${id}/replay`)}
            leftIcon={<PlayCircle size={15} />}
          >
            Replay Boardroom
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/app/retries/${id}`)}
            leftIcon={<RotateCcw size={15} />}
          >
            Targeted Retry
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Download size={15} />}
            title="Export / Print Report"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <EvaluationStatus
        status={report.status}
        reviewer={report.reviewer}
        releasedAt={report.releasedAt}
        revision={report.revision}
      />

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Tabs
          tabs={[
            { id: 'candidate', label: 'Candidate Scorecard & Evidence', icon: <Award size={15} /> },
            { id: 'interviewer', label: 'Interviewer & Question Quality', icon: <Sparkles size={15} /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'candidate' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRubricDetails(!showRubricDetails)}
            rightIcon={showRubricDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          >
            {showRubricDetails ? 'Hide Rubric Definitions' : 'View Rubric Matrix'}
          </Button>
        )}
      </div>

      {/* TAB 1: CANDIDATE SCORECARD */}
      {activeTab === 'candidate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Row: Overall Score Card + 4 Criterion ScoreBars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Overall Composite Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                borderRadius: 'var(--radius-card, 14px)',
                border: '1px solid var(--color-border, #E5DFD6)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary, #B85042)' }}>
                    Composite Performance
                  </span>
                  {!isPending && scores.percentile && (
                    <Badge variant="reviewed">Top {100 - scores.percentile}%</Badge>
                  )}
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  {isPending ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning, #9E671E)' }} className="dev3-pulse">
                      <Clock size={28} />
                      <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>Grading in progress</span>
                    </div>
                  ) : (
                    <>
                      <span
                        style={{
                          fontSize: '48px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--color-text-main, #1A1816)',
                          lineHeight: 1,
                        }}
                      >
                        {scores.composite?.toFixed(1) || '3.4'}
                      </span>
                      <span style={{ fontSize: '18px', color: 'var(--color-text-muted, #8C857B)', fontWeight: 500 }}>
                        / {scores.max?.toFixed(1) || '4.0'}
                      </span>
                    </>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  {isPending
                    ? 'Evaluator review queued. Automated calibration workers are verifying transcript turns.'
                    : 'Weighted composite across technical accuracy, architectural defense, direct relevance, and operational triage.'}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--color-border-subtle, #EFECE6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--color-text-muted, #8C857B)',
                }}
              >
                <span>Curriculum Turns: <strong style={{ color: 'var(--color-text-main, #1A1816)' }}>{interview.totalTurns || 8}</strong></span>
                <span>Level Fit: <strong style={{ color: 'var(--color-success, #2D7252)' }}>Proficient</strong></span>
              </div>
            </div>

            {/* Criteria Breakdown Container */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)', margin: 0 }}>
                  Evidence-Based Core Criteria
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>Calibrated 4.0 Scale</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {criteria.map((c) => (
                  <ScoreBar
                    key={c.id}
                    label={c.label}
                    score={c.score}
                    max={c.max || 4.0}
                    weight={c.weight}
                    colorVariant={c.colorVariant || 'accent'}
                    showValue={!isPending}
                    isPending={isPending || c.isPending}
                    description={c.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rubric Matrix Dropdown if toggled */}
          {showRubricDetails && (
            <div style={{ animation: 'dev3FadeIn 0.2s ease forwards' }}>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--color-primary, #B85042)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)', margin: 0 }}>
                  Calibrated Leveling Rubric Matrix
                </h3>
              </div>
              <RubricTable criteria={criteria} isPending={isPending} />
            </div>
          )}

          {/* Curriculum Coverage Chart */}
          <CoverageChart coverage={report.coverage} isPending={isPending} />

          {/* Turn-by-Turn Answer Review Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)', margin: 0 }}>
                  Turn-by-Turn Answer Review
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>
                  Inspect candidate answers, calibrated marks, and linked evidentiary quotes.
                </span>
              </div>

              <span style={{ fontSize: '12px', color: 'var(--color-primary, #B85042)', fontWeight: 600 }}>
                {turns.length} Boardroom Turns
              </span>
            </div>

            {/* Answer Cards List */}
            {turns.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem',
                  backgroundColor: 'var(--color-surface, #FFFFFF)',
                  borderRadius: '12px',
                  border: '1px dashed var(--color-border, #E5DFD6)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted, #8C857B)',
                }}
              >
                No answer turns recorded for this session.
              </div>
            ) : (
              turns.map((turn) => {
                const isExpanded = expandedTurns[turn.turnPosition];
                const stageLabel = turn.stage?.replace('_', ' ') || 'Technical';

                return (
                  <div
                    key={turn.turnPosition}
                    style={{
                      backgroundColor: 'var(--color-surface, #FFFFFF)',
                      borderRadius: 'var(--radius-card, 14px)',
                      border: '1px solid var(--color-border, #E5DFD6)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-card)',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    {/* Turn Header */}
                    <div
                      style={{
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        backgroundColor: '#FAF7F2',
                        borderBottom: isExpanded ? '1px solid var(--color-border, #E5DFD6)' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleTurn(turn.turnPosition)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: 1, minWidth: '280px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(184, 80, 66, 0.08)',
                            color: 'var(--color-primary, #B85042)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          #{turn.turnPosition}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary, #B85042)', fontWeight: 600, letterSpacing: '0.06em' }}>
                              {stageLabel}
                            </span>
                            <span style={{ color: 'var(--color-text-muted, #8C857B)', fontSize: '11px' }}>•</span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #5E5953)' }}>{turn.panelName}</span>
                          </div>

                          <h4 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)', margin: 0, lineHeight: 1.4 }}>
                            {turn.prompt}
                          </h4>
                        </div>
                      </div>

                      {/* Score & Toggle */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          flexShrink: 0,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: turn.score >= 3.5 ? 'var(--color-success, #2D7252)' : turn.score >= 3.0 ? 'var(--color-primary, #B85042)' : 'var(--color-warning, #9E671E)',
                            }}
                          >
                            {turn.score.toFixed(1)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}> / 4.0</span>
                        </div>

                        <button
                          onClick={() => toggleTurn(turn.turnPosition)}
                          style={{
                            padding: '0.375rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--color-surface, #FFFFFF)',
                            color: 'var(--color-text-secondary, #5E5953)',
                            border: '1px solid var(--color-border, #E5DFD6)',
                            cursor: 'pointer',
                          }}
                          aria-label={isExpanded ? 'Collapse turn' : 'Expand turn'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Turn Expanded Content */}
                    {isExpanded && (
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#FFFFFF' }}>
                        {/* Candidate Answer Box */}
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #5E5953)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <User size={13} />
                            <span>Candidate Response</span>
                          </div>
                          <div
                            style={{
                              padding: '1rem',
                              backgroundColor: 'var(--color-bg, #FAF7F2)',
                              borderRadius: '8px',
                              border: '1px solid var(--color-border-subtle, #EFECE6)',
                              fontSize: '13px',
                              color: 'var(--color-text-main, #1A1816)',
                              lineHeight: 1.6,
                            }}
                          >
                            {turn.candidateAnswer}
                          </div>
                        </div>

                        {/* Missing Points / Gaps */}
                        {turn.evidence?.missingPoints && turn.evidence.missingPoints.length > 0 && (
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-warning, #9E671E)', marginBottom: '0.375rem' }}>
                              Identified Gaps & Missing Considerations
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {turn.evidence.missingPoints.map((gap, i) => (
                                <div
                                  key={i}
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--color-warning, #9E671E)',
                                    backgroundColor: '#FAF2E6',
                                    border: '1px solid rgba(158, 103, 30, 0.25)',
                                    borderRadius: '6px',
                                    padding: '0.375rem 0.625rem',
                                  }}
                                >
                                  {gap}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bottom Actions Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid var(--color-border-subtle, #EFECE6)',
                          }}
                        >
                          <Badge variant="reviewed" icon={<ShieldCheck size={13} />}>
                            {turn.source}
                          </Badge>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {turn.eligibleForRetry && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/app/retries/${id}?turn=${turn.turnPosition}`)}
                                leftIcon={<RotateCcw size={14} />}
                              >
                                Retry This Skill
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEvidence(turn)}
                              leftIcon={<Quote size={14} />}
                            >
                              View Verifiable Evidence
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERVIEWER & QUESTION QUALITY */}
      {activeTab === 'interviewer' && (
        <QuestionQualityCard questionQuality={report.questionQuality} />
      )}

      {/* Evidence Side Drawer */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        evidence={selectedEvidence?.evidence}
        turnPosition={selectedEvidence?.turnPosition}
        sessionId={id}
        questionPrompt={selectedEvidence?.questionPrompt}
      />
    </div>
  );
}

export default ReportPage;
