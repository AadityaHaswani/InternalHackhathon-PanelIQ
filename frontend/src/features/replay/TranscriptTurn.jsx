import React from 'react';
import { User, Shield, Briefcase, Award, Clock, AlertTriangle, RotateCcw, Quote } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

/**
 * TranscriptTurn - Reusable Boardroom Dialogue Turn Component
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 */
export function TranscriptTurn({
  turn,
  isHighlighted = false,
  sessionId,
  onOpenEvidence,
}) {
  const navigate = useNavigate();

  const roleConfig = {
    chair: {
      label: 'Panel Chair',
      color: 'var(--color-primary, #B85042)',
      bg: 'rgba(184, 80, 66, 0.08)',
      border: 'rgba(184, 80, 66, 0.25)',
      icon: <Award size={15} color="var(--color-primary, #B85042)" />,
    },
    specialist: {
      label: 'Technical Specialist',
      color: 'var(--color-success, #2D7252)',
      bg: '#EBF4EF',
      border: 'rgba(45, 114, 82, 0.25)',
      icon: <Shield size={15} color="var(--color-success, #2D7252)" />,
    },
    evaluator: {
      label: 'Project Evaluator',
      color: 'var(--color-warning, #9E671E)',
      bg: '#FAF2E6',
      border: 'rgba(158, 103, 30, 0.25)',
      icon: <Briefcase size={15} color="var(--color-warning, #9E671E)" />,
    },
  };

  const stageLabel = (turn.stage || 'technical').replace('_', ' ').toUpperCase();
  const currentRole = roleConfig[turn.speakerRole] || roleConfig.chair;

  return (
    <div
      id={`turn-${turn.position || turn.id}`}
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        borderRadius: 'var(--radius-card, 14px)',
        border: isHighlighted ? '2px solid var(--color-primary, #B85042)' : '1px solid var(--color-border, #E5DFD6)',
        boxShadow: isHighlighted ? '0 0 16px rgba(184, 80, 66, 0.18)' : 'var(--shadow-card)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Turn Header Metadata */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: '#FAF7F2',
          borderBottom: '1px solid var(--color-border, #E5DFD6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--color-primary, #B85042)',
              border: '1px solid var(--color-border, #E5DFD6)',
            }}
          >
            Turn #{turn.position}
          </span>

          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted, #8C857B)', letterSpacing: '0.06em' }}>
            {stageLabel}
          </span>

          <span style={{ color: 'var(--color-border, #E5DFD6)', fontSize: '11px' }}>•</span>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: currentRole.bg,
              color: currentRole.color,
              border: `1px solid ${currentRole.border}`,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {currentRole.icon}
            <span>{turn.speakerName} ({currentRole.label})</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> {turn.timestamp || '00:00:00'}
          </span>
          {turn.score !== undefined && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                color: turn.score >= 3.5 ? 'var(--color-success, #2D7252)' : turn.score >= 3.0 ? 'var(--color-primary, #B85042)' : 'var(--color-warning, #9E671E)',
              }}
            >
              Score: {turn.score.toFixed(1)} / 4.0
            </span>
          )}
        </div>
      </div>

      {/* Main Turn Dialogue Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#FFFFFF' }}>
        {/* Panel Question */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: currentRole.color, marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
            Interviewer Prompt
          </div>
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#FAF7F2',
              border: '1px solid var(--color-border-subtle, #EFECE6)',
              borderRadius: 'var(--radius-control, 8px)',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-main, #1A1816)',
              lineHeight: 1.5,
            }}
          >
            {turn.question}
          </div>
        </div>

        {/* Constraint Challenge if present */}
        {turn.constraint && (
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: '#FAF2E6',
              border: '1px solid rgba(158, 103, 30, 0.25)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-warning, #9E671E)', fontSize: '12px', fontWeight: 700 }}>
              <AlertTriangle size={14} />
              <span>In-Simulation Constraint Shift</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary, #5E5953)', margin: 0 }}>
              <strong>Condition Change:</strong> {turn.constraint.change}
            </p>
            {turn.constraint.followUp && (
              <p style={{ fontSize: '12px', color: 'var(--color-warning, #9E671E)', margin: 0 }}>
                <strong>Follow-up:</strong> {turn.constraint.followUp}
              </p>
            )}
          </div>
        )}

        {/* Candidate Response */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #5E5953)',
              marginBottom: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <User size={13} />
            <span>Candidate Boardroom Answer</span>
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
            {turn.answer}
          </div>
        </div>

        {/* Action Controls for Turn */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--color-border-subtle, #EFECE6)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>
            Boardroom Audio/Text Invariant • Read-only Record
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {turn.eligibleForRetry && sessionId && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/app/retries/${sessionId}?turn=${turn.position}`)}
                leftIcon={<RotateCcw size={13} />}
              >
                Targeted Retry
              </Button>
            )}

            {sessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/interviews/${sessionId}/report`)}
                leftIcon={<Quote size={13} />}
              >
                Inspect in Report
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranscriptTurn;
