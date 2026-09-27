import React from 'react';

/**
 * Reusable PageHeader component with title, description, actions, and breadcrumb slot.
 */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '2rem',
        ...style,
      }}
    >
      {breadcrumbs && (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {breadcrumbs}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginTop: '0.375rem',
                maxWidth: '640px',
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
