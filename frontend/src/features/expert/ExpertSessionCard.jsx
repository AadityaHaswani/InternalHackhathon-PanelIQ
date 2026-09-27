import React from 'react';
import { User, Calendar, Clock, AlertTriangle, ShieldCheck, ArrowRight, Bot, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

/**
 * ExpertSessionCard - Session Item in Evaluator Review Queue
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 */
export function ExpertSessionCard({ assignment }) {
  const navigate = useNavigate();

  const {
    sessionId,
    candidate = {},
    interviewDate,
    interviewDuration,
    status,
    statusLabel,
    aiScore,
    reviewedScore,
    flaggedTurnsCount,
    flaggedReason,
  } = assignment;

  const isReviewed = status === 'reviewed' || status === 'human_reviewed';
  const isPending = status === 'pending';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        borderRadius: 'var(--radius-card, 14px)',
        border: '1px solid var(--color-border, #E5DFD6)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s ease, transform 0.15s ease',
      }}
      className="dev3-card"
    >
      {/* Top Row: Candidate & Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(184, 80, 66, 0.08)',
              border: '1px solid rgba(184, 80, 66, 0.2)',
              color: 'var(--color-primary, #B85042)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
            }}
          >
            {candidate.name?.charAt(0) || 'C'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-text-main, #1A1816)',
                  margin: 0,
                }}
              >
                {candidate.name || 'Alex Chen'}
              </h3>
              <Badge variant="accent" style={{ fontSize: '10px' }}>
                {candidate.level || 'Junior'}
              </Badge>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)', marginTop: '2px' }}>
              Target Role: <span style={{ color: 'var(--color-text-secondary, #5E5953)', fontWeight: 500 }}>{candidate.role || 'Backend Developer'}</span> • {candidate.email}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isReviewed ? (
            <Badge variant="reviewed" icon={<UserCheck size={12} />}>
              {statusLabel || 'Human Reviewed'}
            </Badge>
          ) : isPending ? (
            <Badge variant="pending" icon={<Clock size={12} className="dev3-pulse" />}>
              {statusLabel || 'Pending Grading'}
            </Badge>
          ) : (
            <Badge variant="draft" icon={<Bot size={12} />}>
              {statusLabel || 'AI Draft Ready'}
            </Badge>
          )}
        </div>
      </div>

      {/* Middle Row: Metadata & Scores */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '0.875rem 1rem',
          backgroundColor: 'var(--color-bg, #FAF7F2)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-subtle, #EFECE6)',
          fontSize: '12px',
        }}
      >
        <div>
          <span style={{ color: 'var(--color-text-muted, #8C857B)', display: 'block' }}>Interview Date</span>
          <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>{interviewDate || '2026-09-27'}</span>
        </div>

        <div>
          <span style={{ color: 'var(--color-text-muted, #8C857B)', display: 'block' }}>Session Duration</span>
          <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>{interviewDuration || '33 mins'}</span>
        </div>

        <div>
          <span style={{ color: 'var(--color-text-muted, #8C857B)', display: 'block' }}>AI Draft Score</span>
          <span style={{ color: 'var(--color-primary, #B85042)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {aiScore !== null && aiScore !== undefined ? `${aiScore.toFixed(1)} / 4.0` : 'Pending'}
          </span>
        </div>

        <div>
          <span style={{ color: 'var(--color-text-muted, #8C857B)', display: 'block' }}>Certified Score</span>
          <span style={{ color: isReviewed ? 'var(--color-success, #2D7252)' : 'var(--color-text-muted, #8C857B)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {reviewedScore ? `${reviewedScore.toFixed(1)} / 4.0` : 'Awaiting Review'}
          </span>
        </div>
      </div>

      {/* Flagged Item Warning if present */}
      {flaggedTurnsCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '6px',
            backgroundColor: '#FAF2E6',
            border: '1px solid rgba(158, 103, 30, 0.25)',
            fontSize: '12px',
            color: 'var(--color-warning, #9E671E)',
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>{flaggedReason}</span>
        </div>
      )}

      {/* Card Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--color-border-subtle, #EFECE6)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', fontFamily: 'var(--font-mono)' }}>
          ID: {sessionId}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/interviews/${sessionId}/report`)}
          >
            Candidate Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/expert/sessions/${sessionId}`)}
            rightIcon={<ArrowRight size={14} />}
          >
            {isReviewed ? 'Inspect Certified Review' : 'Open Review Workspace'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExpertSessionCard;
