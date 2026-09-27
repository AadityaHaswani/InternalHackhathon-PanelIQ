import React from 'react';
import { Bot, UserCheck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * EvaluationStatus - Status Banner and Badges for Scorecard
 * Styled to match the warm editorial visual reference.
 *
 * States:
 * - 'draft' | 'ai_draft': AI Draft (Preliminary algorithmic scorecard)
 * - 'reviewed' | 'human_reviewed': Human Reviewed (Signed off by Staff Evaluator)
 * - 'pending': Pending (Evaluation calibration underway - NEVER DISPLAYED AS ZERO)
 */
export function EvaluationStatus({
  status = 'draft',
  reviewer,
  releasedAt,
  revision = 1,
  compact = false,
  pendingReason = 'Asynchronous calibration grading in progress. Evaluator verification scheduled.',
  style = {},
}) {
  const normalizedStatus =
    status === 'reviewed' || status === 'human_reviewed' ? 'reviewed' :
    status === 'pending' ? 'pending' : 'draft';

  const config = {
    reviewed: {
      label: 'Human Reviewed',
      badgeColor: '#2D7252',
      badgeBg: '#EBF4EF',
      border: '1px solid rgba(45, 114, 82, 0.25)',
      icon: <UserCheck size={16} color="#2D7252" />,
      title: 'Verified by Expert Panel',
      description: reviewer
        ? `Authoritative evaluation reviewed and certified by ${reviewer.name || 'Staff Evaluator'} (${reviewer.role || 'Evaluator'}). Overrides and evidence are permanently recorded.`
        : 'Authoritative evaluation confirmed by approved human evaluator.',
    },
    draft: {
      label: 'AI Draft',
      badgeColor: '#B85042',
      badgeBg: 'rgba(184, 80, 66, 0.08)',
      border: '1px solid rgba(184, 80, 66, 0.2)',
      icon: <Bot size={16} color="#B85042" />,
      title: 'Preliminary AI Draft Proposal',
      description:
        'Algorithmic evaluation generated from calibrated rubrics and answer excerpts. Subject to review and score adjustments by an assigned expert reviewer.',
    },
    pending: {
      label: 'Pending Verification',
      badgeColor: '#9E671E',
      badgeBg: '#FAF2E6',
      border: '1px solid rgba(158, 103, 30, 0.25)',
      icon: <Clock size={16} color="#9E671E" className="dev3-pulse" />,
      title: 'Scoring In Progress',
      description: pendingReason,
    },
  };

  const current = config[normalizedStatus];

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.2rem 0.625rem',
          borderRadius: '9999px',
          backgroundColor: current.badgeBg,
          color: current.badgeColor,
          border: current.border,
          fontSize: '12px',
          fontWeight: 600,
          ...style,
        }}
      >
        {current.icon}
        <span>{current.label}</span>
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-card, 14px)',
        backgroundColor: current.badgeBg,
        border: current.border,
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {current.icon}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: current.badgeColor }}>
              {current.title}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: current.badgeColor,
                border: current.border,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {current.label}
            </span>
            {revision > 1 && (
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary, #5E5953)',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border-subtle, #EFECE6)',
                }}
              >
                Rev {revision}
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary, #5E5953)',
              marginTop: '0.375rem',
              lineHeight: 1.5,
              maxWidth: '720px',
            }}
          >
            {current.description}
          </p>

          {releasedAt && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '11px',
                color: 'var(--color-text-muted, #8C857B)',
                marginTop: '0.5rem',
              }}
            >
              <ShieldCheck size={13} color="#2D7252" />
              <span>Released {new Date(releasedAt).toLocaleDateString()} at {new Date(releasedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvaluationStatus;
