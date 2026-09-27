import React, { useEffect, useState } from 'react';

/**
 * Animated Horizontal Score Bar (Warm Editorial Theme matching reference image)
 *
 * @param {Object} props
 * @param {number} props.score - Current score (0 to max)
 * @param {number} [props.max=4.0] - Maximum score scale
 * @param {string} [props.label] - Title of the criterion or category
 * @param {number} [props.weight] - Relative weighting (e.g. 0.35)
 * @param {'accent' | 'success' | 'warning' | 'error' | 'primary'} [props.colorVariant='accent']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.showValue=true] - Whether to render numerical score
 * @param {boolean} [props.isPending=false] - If true, displays active gradient pulse instead of zero
 * @param {string} [props.badgeText] - Optional status badge text
 * @param {string} [props.description] - Subtext explanation
 */
export function ScoreBar({
  score = 0,
  max = 4.0,
  label,
  weight,
  colorVariant = 'accent',
  size = 'md',
  showValue = true,
  isPending = false,
  badgeText,
  description,
  className = '',
  style = {},
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const percentage = Math.min(100, Math.max(0, (score / max) * 100));

  useEffect(() => {
    if (isPending) {
      setAnimatedWidth(100);
      return;
    }
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 60);
    return () => clearTimeout(timer);
  }, [percentage, isPending]);

  // Warm editorial color palette from reference image & tokens.css
  const colorMap = {
    accent: {
      bar: 'linear-gradient(90deg, #C85A32 0%, #B85042 100%)',
      text: '#B85042',
      badgeBg: 'rgba(184, 80, 66, 0.08)',
      border: 'rgba(184, 80, 66, 0.25)',
    },
    primary: {
      bar: 'linear-gradient(90deg, #C85A32 0%, #B85042 100%)',
      text: '#B85042',
      badgeBg: 'rgba(184, 80, 66, 0.08)',
      border: 'rgba(184, 80, 66, 0.25)',
    },
    success: {
      bar: 'linear-gradient(90deg, #3A8E67 0%, #2D7252 100%)',
      text: '#2D7252',
      badgeBg: '#EBF4EF',
      border: 'rgba(45, 114, 82, 0.25)',
    },
    warning: {
      bar: 'linear-gradient(90deg, #B57723 0%, #9E671E 100%)',
      text: '#9E671E',
      badgeBg: '#FAF2E6',
      border: 'rgba(158, 103, 30, 0.25)',
    },
    error: {
      bar: 'linear-gradient(90deg, #C84646 0%, #B83838 100%)',
      text: '#B83838',
      badgeBg: '#FDF2F2',
      border: 'rgba(184, 56, 56, 0.25)',
    },
  };

  const resolvedColor =
    percentage >= 80 ? colorMap.success :
    percentage >= 60 ? colorMap.accent :
    percentage >= 40 ? colorMap.warning : colorMap.error;

  const activeColor = colorMap[colorVariant] || resolvedColor;

  const heightMap = {
    sm: '6px',
    md: '8px',
    lg: '12px',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        width: '100%',
        ...style,
      }}
      className={`score-bar-container ${className}`}
    >
      {(label || showValue || badgeText) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.5rem',
            fontSize: size === 'sm' ? '12px' : '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {label && (
              <span style={{ fontWeight: 600, color: 'var(--color-text-main, #1A1816)' }}>
                {label}
              </span>
            )}
            {weight !== undefined && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>
                ({Math.round(weight * 100)}% weight)
              </span>
            )}
            {badgeText && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: activeColor.badgeBg,
                  color: activeColor.text,
                  border: `1px solid ${activeColor.border}`,
                }}
              >
                {badgeText}
              </span>
            )}
          </div>

          {showValue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {isPending ? (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-warning, #9E671E)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  className="dev3-pulse"
                >
                  Pending Review
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 700,
                    color: activeColor.text,
                    fontSize: size === 'lg' ? '16px' : '13px',
                  }}
                >
                  {score.toFixed(1)}{' '}
                  <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-text-muted, #8C857B)' }}>
                    / {max.toFixed(1)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div
        className="dev3-score-track"
        style={{
          height: heightMap[size] || '8px',
          backgroundColor: 'var(--color-surface-subtle, #F3EFEA)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--color-border-subtle, #EFECE6)',
        }}
        role="progressbar"
        aria-valuenow={isPending ? undefined : score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Score'}
      >
        <div
          className={`dev3-score-fill ${isPending ? 'dev3-pulse' : ''}`}
          style={{
            width: `${animatedWidth}%`,
            height: '100%',
            background: isPending
              ? 'linear-gradient(90deg, rgba(158, 103, 30, 0.15) 0%, rgba(158, 103, 30, 0.45) 50%, rgba(158, 103, 30, 0.15) 100%)'
              : activeColor.bar,
            borderRadius: '9999px',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {description && (
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', lineHeight: 1.4 }}>
          {description}
        </span>
      )}
    </div>
  );
}

export default ScoreBar;
