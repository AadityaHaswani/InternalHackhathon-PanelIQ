import React from 'react';
import { Target, CheckCircle2, Lightbulb, HelpCircle, FileCheck, Layers } from 'lucide-react';
import { ScoreBar } from './ScoreBar';

/**
 * QuestionQualityCard - Interviewer Quality & Assessment Calibration Dashboard
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 */
export function QuestionQualityCard({ questionQuality = {} }) {
  const {
    roleRelevance = 3.9,
    levelFit = 3.7,
    clarity = 3.8,
    assessability = 3.6,
    topicCoveragePercent = 94,
    totalPromptsEvaluated = 8,
    recommendations = [],
    rubricMetrics = [],
  } = questionQuality;

  const metrics = [
    {
      id: 'roleRelevance',
      label: 'Role Relevance',
      score: roleRelevance,
      weight: 0.25,
      colorVariant: 'accent',
      description: 'Alignment with day-to-day production responsibilities and core technologies.',
      icon: <Target size={16} color="var(--color-primary, #B85042)" />,
    },
    {
      id: 'levelFit',
      label: 'Level Fit (Experience Band)',
      score: levelFit,
      weight: 0.25,
      colorVariant: 'primary',
      description: 'Absence of artificial puzzle trivia; calibrated for accurate seniority leveling.',
      icon: <FileCheck size={16} color="var(--color-primary, #B85042)" />,
    },
    {
      id: 'clarity',
      label: 'Clarity & Framing',
      score: clarity,
      weight: 0.25,
      colorVariant: 'success',
      description: 'Crisp scenario definitions, explicit constraints, and unambiguous boundary conditions.',
      icon: <CheckCircle2 size={16} color="var(--color-success, #2D7252)" />,
    },
    {
      id: 'assessability',
      label: 'Assessability & Rubric Discrimination',
      score: assessability,
      weight: 0.25,
      colorVariant: 'warning',
      description: 'Capacity of the prompt to separate surface memorization from mechanical understanding.',
      icon: <HelpCircle size={16} color="var(--color-warning, #9E671E)" />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Top Banner Explaining Separation */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-card, 14px)',
          backgroundColor: '#FAF5F0',
          border: '1px solid rgba(184, 80, 66, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(184, 80, 66, 0.1)',
              color: 'var(--color-primary, #B85042)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lightbulb size={22} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Interviewer & Question Quality Audit
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '2px', margin: 0 }}>
              Independent evaluation of the board questions — evaluated strictly separately from candidate performance.
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-success, #2D7252)',
            backgroundColor: '#EBF4EF',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(45, 114, 82, 0.3)',
            fontWeight: 600,
          }}
        >
          {topicCoveragePercent}% Curriculum Match
        </div>
      </div>

      {/* Grid of Question Quality Progress Bars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.id}
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              borderRadius: 'var(--radius-card, 14px)',
              border: '1px solid var(--color-border, #E5DFD6)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {metric.icon}
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-text-main, #1A1816)',
                }}
              >
                {metric.label}
              </span>
            </div>

            <ScoreBar
              score={metric.score}
              max={4.0}
              size="md"
              colorVariant={metric.colorVariant}
              showValue={true}
            />

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary, #5E5953)', margin: 0, lineHeight: 1.4 }}>
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      {/* Rubric Discrimination Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border, #E5DFD6)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border, #E5DFD6)',
            backgroundColor: 'var(--color-surface-subtle, #F3EFEA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="var(--color-primary, #B85042)" />
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Question Bank Calibration & Rubric Mapping
            </h4>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>
            {totalPromptsEvaluated} Questions Verified
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'rgba(243, 239, 234, 0.4)',
                borderBottom: '1px solid var(--color-border, #E5DFD6)',
                color: 'var(--color-text-secondary, #5E5953)',
                fontSize: '11px',
                textTransform: 'uppercase',
                textAlign: 'left',
              }}
            >
              <th style={{ padding: '0.75rem 1.25rem', width: '25%' }}>Dimension</th>
              <th style={{ padding: '0.75rem 1.25rem', width: '20%' }}>Quality Index</th>
              <th style={{ padding: '0.75rem 1.25rem', width: '55%' }}>Calibration Standard</th>
            </tr>
          </thead>
          <tbody>
            {(rubricMetrics.length > 0 ? rubricMetrics : metrics.map(m => ({ dimension: m.label, score: m.score, description: m.description }))).map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--color-border-subtle, #EFECE6)',
                  backgroundColor: idx % 2 === 1 ? 'rgba(243, 239, 234, 0.3)' : '#FFFFFF',
                }}
              >
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)', fontSize: '14px' }}>
                  {row.dimension}
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      color: row.score >= 3.7 ? 'var(--color-success, #2D7252)' : 'var(--color-primary, #B85042)',
                    }}
                  >
                    {row.score.toFixed(1)} / 4.0
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Evaluator Recommendations */}
      {recommendations.length > 0 && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--color-bg, #FAF7F2)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-main, #1A1816)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Lightbulb size={18} color="var(--color-primary, #B85042)" />
            <span>Curriculum & Interviewer Recommendations</span>
          </div>

          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              margin: 0,
              paddingLeft: '1.25rem',
              fontSize: '13px',
              color: 'var(--color-text-secondary, #5E5953)',
              lineHeight: 1.5,
            }}
          >
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default QuestionQualityCard;
