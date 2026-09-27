import React from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

/**
 * Reusable DataTable component with column definitions, accessible scroll region, and empty/loading states.
 */
export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No records found',
  onRowClick,
  ariaLabel = 'Data table',
  style = {},
}) {
  return (
    <div
      role="region"
      aria-label={`${ariaLabel} scroll region`}
      tabIndex={0}
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: '600px',
          borderCollapse: 'collapse',
          fontSize: 'var(--font-size-sm)',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-subtle)',
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key || col.header}
                scope="col"
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-secondary)',
                  textAlign: col.align || 'left',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                {columns.map((col, idx) => (
                  <td key={idx} style={{ padding: '1rem' }}>
                    <Skeleton height="1.25rem" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem 1rem' }}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick && onRowClick(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                style={{
                  borderBottom: '1px solid var(--color-border-subtle)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key || col.header}
                    style={{
                      padding: '0.875rem 1rem',
                      color: 'var(--color-text-main)',
                      textAlign: col.align || 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
