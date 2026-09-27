import React from 'react';

/**
 * Reusable Badge component matching PRD visual direction.
 * Variants: reviewed, pending, draft, provisional, default, danger, accent
 */
export function Badge({
  variant = 'default',
  children,
  icon,
  style = {},
  className = '',
  ...rest
}) {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--color-surface-subtle)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    },
    reviewed: {
      backgroundColor: 'var(--badge-reviewed-bg)',
      color: 'var(--badge-reviewed-text)',
      border: '1px solid rgba(45, 114, 82, 0.2)',
    },
    pending: {
      backgroundColor: 'var(--badge-pending-bg)',
      color: 'var(--badge-pending-text)',
      border: '1px solid rgba(158, 103, 30, 0.2)',
    },
    draft: {
      backgroundColor: 'var(--badge-draft-bg)',
      color: 'var(--badge-draft-text)',
      border: '1px solid var(--color-border)',
    },
    provisional: {
      backgroundColor: 'var(--color-info-bg)',
      color: 'var(--color-info)',
      border: '1px solid rgba(43, 94, 134, 0.2)',
    },
    danger: {
      backgroundColor: 'var(--color-error-bg)',
      color: 'var(--color-error)',
      border: '1px solid rgba(184, 56, 56, 0.2)',
    },
    accent: {
      backgroundColor: 'var(--color-surface-subtle)',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.2rem 0.625rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 500,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        ...variantStyles[variant] || variantStyles.default,
        ...style,
      }}
      className={`badge badge-${variant} ${className}`}
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
