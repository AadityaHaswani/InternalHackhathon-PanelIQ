import React from 'react';
import { TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { ScoreBar } from '../reports/ScoreBar';

/**
 * ComparisonCard - Before vs After Performance Evaluation
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 */
export function ComparisonCard({ retryResult }) {
  if (!retryResult) return null;

  const { before, after, delta, targetSkill } = retryResult;
  const isImproved = delta > 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        borderRadius: 'var(--radius-card, 14px)',
        border: '1px solid var(--color-border, #E5DFD6)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Comparison Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#FAF7F2',
          borderBottom: '1px solid var(--color-border, #E5DFD6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(184, 80, 66, 0.08)',
              color: 'var(--color-primary, #B85042)',
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Calibrated Skill Remediation Outcome
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #5E5953)' }}>
              Target Focus: <strong style={{ color: 'var(--color-primary, #B85042)' }}>{targetSkill || 'Concurrency & Idempotency'}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant={isImproved ? 'reviewed' : 'default'} style={{ fontSize: '13px', padding: '0.3rem 0.75rem' }}>
            {isImproved ? `+${delta.toFixed(1)} Score Improvement` : 'No score delta'}
          </Badge>
        </div>
      </div>

      {/* Side-by-Side Before vs After Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          padding: '1.5rem',
        }}
      >
        {/* BEFORE CARD */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg, #FAF7F2)',
            borderRadius: '10px',
            border: '1px solid var(--color-border, #E5DFD6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Original Interview Turn
            </span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--color-error, #B83838)', fontSize: '20px' }}>
              {before.score.toFixed(1)} <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>/ 4.0</span>
            </span>
          </div>

          <ScoreBar score={before.score} max={4.0} size="sm" colorVariant="error" showValue={false} />

          {/* Strengths */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary, #5E5953)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demonstrated Strengths
            </span>
            <ul style={{ margin: '0.375rem 0 0 0', paddingLeft: '1.25rem', fontSize: '13px', color: 'var(--color-text-main, #1A1816)', lineHeight: 1.5 }}>
              {before.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-error, #B83838)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Evaluated Gaps & Omissions
            </span>
            <ul style={{ margin: '0.375rem 0 0 0', paddingLeft: '1.25rem', fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
              {before.gaps.map((gap, i) => (
                <li key={i} style={{ color: 'var(--color-error, #B83838)' }}>
                  <span style={{ color: 'var(--color-text-main, #1A1816)' }}>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AFTER CARD */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: '10px',
            border: '1px solid rgba(45, 114, 82, 0.35)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success, #2D7252)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Revised Remediation Attempt
            </span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--color-success, #2D7252)', fontSize: '22px' }}>
              {after.score.toFixed(1)} <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>/ 4.0</span>
            </span>
          </div>

          <ScoreBar score={after.score} max={4.0} size="sm" colorVariant="success" showValue={false} />

          {/* New Strengths */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success, #2D7252)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Remediated Proficiencies
            </span>
            <ul style={{ margin: '0.375rem 0 0 0', paddingLeft: '1.25rem', fontSize: '13px', color: 'var(--color-text-main, #1A1816)', lineHeight: 1.5 }}>
              {after.strengths.map((str, i) => (
                <li key={i} style={{ color: 'var(--color-success, #2D7252)' }}>
                  <span style={{ color: 'var(--color-text-main, #1A1816)' }}>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Remaining Gaps */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-warning, #9E671E)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Remaining Refinements
            </span>
            <ul style={{ margin: '0.375rem 0 0 0', paddingLeft: '1.25rem', fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
              {after.remainingGaps.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Immutability & Contract Notice */}
      <div
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#FAF7F2',
          borderTop: '1px solid var(--color-border, #E5DFD6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '12px',
          color: 'var(--color-text-secondary, #5E5953)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ShieldCheck size={14} color="var(--color-success, #2D7252)" />
          <span>Same Rubric Calibrated (v1.0) • Original session transcript left strictly immutable.</span>
        </div>

        <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-muted, #8C857B)' }}>
          Attempt ID: {retryResult.id}
        </span>
      </div>
    </div>
  );
}

export default ComparisonCard;
