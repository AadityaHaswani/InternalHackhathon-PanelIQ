import React from 'react';

/**
 * Reusable Input component with label, helperText, and error states.
 */
export function Input({
  label,
  id,
  helperText,
  error,
  required = false,
  className = '',
  style = {},
  inputStyle = {},
  ...rest
}) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
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

      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '0.625rem 0.875rem',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-main)',
          backgroundColor: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-control)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          boxSizing: 'border-box',
          ...inputStyle,
        }}
        className={`input-control ${error ? 'input-error' : ''} ${className}`}
        {...rest}
      />

      {error ? (
        <span id={`${inputId}-error`} role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', marginTop: '2px' }}>
          {error}
        </span>
      ) : helperText ? (
        <span id={`${inputId}-helper`} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default Input;
