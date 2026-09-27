import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { normalizePanelRole, PANEL_MEMBERS } from './PanelCard';

/**
 * QuestionCard - Renders the primary prompt asked by the simulated evaluator
 */
export function QuestionCard({
  prompt = '',
  stage = 'icebreaker',
  panelRole = 'chair',
  topics = [],
  difficulty = 1,
  questionId = '',
}) {
  const normalizedKey = normalizePanelRole(panelRole);
  const speaker = PANEL_MEMBERS[normalizedKey] || PANEL_MEMBERS.chair;

  return (
    <article
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
      aria-labelledby="current-prompt-heading"
    >
      {/* Metadata bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: speaker.avatarBg,
                display: 'inline-block',
              }}
              aria-hidden="true"
            />
            {speaker.name} ({speaker.role})
          </span>

          <span style={{ color: 'var(--color-border)' }}>•</span>

          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              textTransform: 'capitalize',
            }}
          >
            {stage.replace('_', ' ')}
          </span>
        </div>

        {/* Topic tags & difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          {topics.map((t) => (
            <Badge key={t} variant="draft">
              #{t.replace('_', ' ')}
            </Badge>
          ))}
          {difficulty && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface-subtle)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
              }}
              title={`Difficulty level ${difficulty} of 3`}
            >
              {'●'.repeat(difficulty)}{'○'.repeat(Math.max(0, 3 - difficulty))}
            </span>
          )}
        </div>
      </div>

      {/* Primary prompt typography */}
      <div>
        <h2
          id="current-prompt-heading"
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            lineHeight: 1.45,
            color: 'var(--color-text-main)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {prompt || 'Loading question prompt...'}
        </h2>
      </div>

      {/* Stable Question ID for evaluation link */}
      {questionId && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            textAlign: 'right',
          }}
        >
          Ref: {questionId}
        </div>
      )}
    </article>
  );
}
