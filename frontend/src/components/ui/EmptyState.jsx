import React from 'react';

/**
 * Reusable EmptyState component.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            color: 'var(--color-text-muted)',
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-surface-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.375rem' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: action ? '1.25rem' : 0 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export default EmptyState;
