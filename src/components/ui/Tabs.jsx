import React from 'react';

/**
 * Reusable Tabs navigation component.
 */
export function Tabs({ tabs = [], activeTab, onChange, style = {} }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem',
        backgroundColor: 'var(--color-surface-subtle)',
        borderRadius: 'var(--radius-control)',
        border: '1px solid var(--color-border)',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'var(--color-surface-subtle)' : 'var(--color-border)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
