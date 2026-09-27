import React from 'react';
import { CheckCircle2, AlertTriangle, Layers, PieChart } from 'lucide-react';
import { ScoreBar } from './ScoreBar';

/**
 * CoverageChart - Technical Domain & Topic Coverage Visualization
 * Warm editorial aesthetic matching reference image.
 */
export function CoverageChart({ coverage = {}, isPending = false }) {
  const domains = coverage.domains || [
    { name: 'APIs & Contracts', weight: 0.25, score: 3.8, questionsCount: 2, status: 'proficient' },
    { name: 'Databases & Indexing', weight: 0.25, score: 3.5, questionsCount: 2, status: 'proficient' },
    { name: 'Concurrency & Locking', weight: 0.25, score: 2.8, questionsCount: 2, status: 'needs_retry' },
    { name: 'Project Trade-offs & Triage', weight: 0.25, score: 3.7, questionsCount: 2, status: 'mastered' },
  ];

  const totalPlanned = coverage.totalPlanned || 8;
  const totalEvaluated = coverage.totalEvaluated || 8;
  const coveragePercent = coverage.coveragePercent || Math.round((totalEvaluated / totalPlanned) * 100);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.5rem',
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        borderRadius: 'var(--radius-card, 14px)',
        border: '1px solid var(--color-border, #E5DFD6)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header & Overall Metric */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--color-border-subtle, #EFECE6)',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(184, 80, 66, 0.08)',
              color: 'var(--color-primary, #B85042)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={20} />
          </div>
          <div>
            <h4
              style={{
                fontSize: '17px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Curriculum Domain Coverage
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>
              {totalEvaluated} of {totalPlanned} questions evaluated ({coveragePercent}% complete)
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-surface-subtle, #F3EFEA)',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid var(--color-border, #E5DFD6)',
          }}
        >
          <PieChart size={14} color="var(--color-success, #2D7252)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main, #1A1816)' }}>
            {coveragePercent}% Covered
          </span>
        </div>
      </div>

      {/* Domain Breakdown Bars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {domains.map((domain) => {
          const isMastered = domain.score >= 3.6;
          const isProficient = domain.score >= 3.0 && domain.score < 3.6;
          const needsRetry = domain.score < 3.0;

          const variant = isMastered ? 'success' : isProficient ? 'accent' : 'warning';

          return (
            <div
              key={domain.name}
              style={{
                backgroundColor: 'var(--color-bg, #FAF7F2)',
                border: '1px solid var(--color-border-subtle, #EFECE6)',
                borderRadius: 'var(--radius-control, 8px)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main, #1A1816)' }}>
                  {domain.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>
                  {domain.questionsCount} question{domain.questionsCount > 1 ? 's' : ''}
                </span>
              </div>

              <ScoreBar
                score={domain.score}
                max={4.0}
                size="sm"
                colorVariant={variant}
                showValue={!isPending}
                isPending={isPending || domain.status === 'pending'}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  paddingTop: '0.25rem',
                }}
              >
                <span style={{ color: 'var(--color-text-muted, #8C857B)' }}>
                  Weight: {Math.round((domain.weight || 0.25) * 100)}%
                </span>

                {needsRetry ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: 'var(--color-warning, #9E671E)',
                      fontWeight: 600,
                    }}
                  >
                    <AlertTriangle size={12} />
                    <span>Eligible for Retry</span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: 'var(--color-success, #2D7252)',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>{isMastered ? 'Mastered' : 'Proficient'}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CoverageChart;
