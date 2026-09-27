import React from 'react';

/**
 * Reusable Select dropdown component.
 */
export function Select({
  label,
  id,
  options = [],
  helperText,
  error,
  required = false,
  className = '',
  style = {},
  selectStyle = {},
  ...rest
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            color: error ? 'var(--color-error)' : 'var(--color-text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-primary)' }} aria-hidden="true">*</span>}
        </label>
      )}

      <select
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '0.625rem 0.875rem',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-main)',
          backgroundColor: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-control)',
          cursor: 'pointer',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          boxSizing: 'border-box',
          ...selectStyle,
        }}
        className={`select-control ${error ? 'select-error' : ''} ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <span id={`${selectId}-error`} role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', marginTop: '2px' }}>
          {error}
        </span>
      ) : helperText ? (
        <span id={`${selectId}-helper`} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default Select;
