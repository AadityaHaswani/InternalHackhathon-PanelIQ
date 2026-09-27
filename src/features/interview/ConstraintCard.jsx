import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/**
 * ConstraintCard - F4 Change One Constraint component.
 * Displays the original baseline scenario, a prominent "New constraint" callout,
 * and an optional expandable view of the candidate's previous response.
 *
 * Strict PRD compliance:
 * - Keep labels explicit and objective.
 * - Do NOT label this as a lie detector or cheating detector.
 */
export function ConstraintCard({
  originalPrompt = '',
  constraintChange = '',
  previousAnswer = '',
  followUpPrompt = '',
}) {
  const [showPreviousAnswer, setShowPreviousAnswer] = useState(false);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
      }}
      role="region"
      aria-label="Constraint Adaptation Scenario"
    >
      {/* Header bar */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--color-surface-subtle)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-warning)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            !
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Adaptive Constraint Challenge
          </span>
        </div>

        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          F4 Simulation Branch
        </span>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Original Scenario Context */}
        {originalPrompt && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                marginBottom: '0.25rem',
              }}
            >
              Original Scenario Baseline
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {originalPrompt}
            </div>
          </div>
        )}

        {/* New Constraint Callout */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid rgba(158, 103, 30, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              color: 'var(--color-warning)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <AlertCircle size={14} />
            <span>New Constraint Introduced</span>
          </div>

          <div
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              lineHeight: 1.45,
            }}
          >
            {constraintChange || 'A new operational constraint has been placed on your previous architecture.'}
          </div>
        </div>

        {/* Follow-up / Direct Question */}
        {followUpPrompt && (
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-primary)',
                marginBottom: '0.25rem',
              }}
            >
              Evaluator Follow-Up
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-lg)',
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main)',
                lineHeight: 1.45,
              }}
            >
              {followUpPrompt}
            </div>
          </div>
        )}

        {/* Optional Expandable Previous Answer */}
        {previousAnswer && (
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreviousAnswer(!showPreviousAnswer)}
              leftIcon={<History size={14} />}
              rightIcon={showPreviousAnswer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            >
              {showPreviousAnswer ? 'Hide Your Previous Answer' : 'Review Your Previous Answer'}
            </Button>

            {showPreviousAnswer && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {previousAnswer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
