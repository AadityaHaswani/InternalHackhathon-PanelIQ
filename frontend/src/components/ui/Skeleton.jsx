import React from 'react';

/**
 * Reusable Skeleton loader for text lines, cards, and avatars.
 */
export function Skeleton({
  variant = 'text',
  width = '100%',
  height,
  borderRadius,
  style = {},
  className = '',
}) {
  const defaultHeights = {
    text: '1rem',
    heading: '1.75rem',
    avatar: '2.5rem',
    card: '6rem',
    tableRow: '3rem',
  };

  const defaultRadii = {
    text: 'var(--radius-xs)',
    heading: 'var(--radius-sm)',
    avatar: 'var(--radius-pill)',
    card: 'var(--radius-card)',
    tableRow: 'var(--radius-sm)',
  };

  return (
    <div
      style={{
        width: variant === 'avatar' && !width ? defaultHeights.avatar : width,
        height: height || defaultHeights[variant] || '1rem',
        borderRadius: borderRadius || defaultRadii[variant] || 'var(--radius-xs)',
        backgroundColor: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-border-subtle)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={`skeleton skeleton-${variant} ${className}`}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
