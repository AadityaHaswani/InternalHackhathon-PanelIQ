import React from 'react';

/**
 * Reusable Button component (PRD Section 8 / D1-01)
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {React.ReactNode} props.children
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  style = {},
  ...rest
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    borderRadius: 'var(--radius-control)',
    transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    boxSizing: 'border-box',
    touchAction: 'manipulation',
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 0.875rem', minHeight: '38px', fontSize: 'var(--font-size-xs)' },
    md: { padding: '0.625rem 1.25rem', minHeight: '44px', fontSize: 'var(--font-size-sm)' },
    lg: { padding: '0.875rem 1.75rem', minHeight: '48px', fontSize: 'var(--font-size-base)' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-primary-text)',
      border: '1px solid var(--color-primary)',
    },
    secondary: {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-secondary-text)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-main)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: 'var(--color-error-bg)',
      color: 'var(--color-error)',
      border: '1px solid var(--color-error)',
    },
  };

  const resolvedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={resolvedStyle}
      className={`btn btn-${variant} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}

export default Button;
