import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, CircleDot, Circle } from 'lucide-react';

export const STAGES = [
  { id: 'icebreaker', label: 'Icebreaker', turns: [1], description: 'Project overview & background' },
  { id: 'technical', label: 'Technical Core', turns: [2, 3, 4, 5], description: 'APIs, concurrency, databases' },
  { id: 'techno_managerial', label: 'Techno-Managerial', turns: [6, 7], description: 'Trade-offs & contracts' },
  { id: 'reflection', label: 'Reflection', turns: [8], description: 'Lessons & learning experiments' },
];

/**
 * Formats seconds into mm:ss
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * StageRail - Displays interview progress through the 4 stages, turn indicator, and elapsed timer
 */
export function StageRail({
  currentTurnPosition = 1,
  totalTurns = 8,
  currentStage = 'icebreaker',
  startTime = null,
  isCompleted = false,
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isCompleted) return;
    const startTimestamp = startTime ? new Date(startTime).getTime() : Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Determine stage states
  const getStageStatus = (stage) => {
    if (isCompleted) return 'completed';
    const currentPosition = currentTurnPosition || 1;
    const maxTurnInStage = Math.max(...stage.turns);
    const minTurnInStage = Math.min(...stage.turns);

    if (currentPosition > maxTurnInStage) return 'completed';
    if (currentPosition >= minTurnInStage && currentPosition <= maxTurnInStage) return 'current';
    return 'upcoming';
  };

  const progressPercent = Math.min(
    100,
    Math.round(((currentTurnPosition - 1) / totalTurns) * 100)
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        padding: '1rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
      role="region"
      aria-label="Interview Stage Navigation"
    >
      {/* Top summary row: Turn count + Timer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-main)',
            }}
          >
            Turn {isCompleted ? totalTurns : currentTurnPosition}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            of {totalTurns} turns
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
          }}
          title="Interview elapsed duration"
        >
          <Clock size={13} style={{ color: 'var(--color-primary)' }} />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Visual progress bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            transition: 'width 300ms ease',
          }}
        />
      </div>

      {/* Stage Chips / Breadcrumbs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.5rem',
          paddingTop: '0.25rem',
        }}
      >
        {STAGES.map((stage) => {
          const status = getStageStatus(stage);
          const isCurrent = status === 'current';
          const isDone = status === 'completed';

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isCurrent ? 'var(--color-surface-subtle)' : 'transparent',
                border: isCurrent
                  ? '1px solid var(--color-primary)'
                  : isDone
                  ? '1px solid var(--color-border-subtle)'
                  : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDone
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-text-muted)',
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <CircleDot size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                    color: isCurrent
                      ? 'var(--color-primary)'
                      : isDone
                      ? 'var(--color-text-main)'
                      : 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {stage.label}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {stage.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
