import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, CloudOff, RefreshCw } from 'lucide-react';

/**
 * SaveIndicator - Provides truthful visual feedback regarding server persistence and local draft state.
 *
 * Rule from PRD Section 7 & 12:
 * “Saved means the backend has acknowledged persistence. During loss of connectivity,
 * show 'Draft on this device — reconnect to submit.' No full offline promise.”
 */
export function SaveIndicator({ state = 'idle', lastSavedTime = null, customMessage = null }) {
  if (state === 'idle' && !customMessage) {
    return null;
  }

  let icon = null;
  let text = '';
  let color = 'var(--color-text-muted)';
  let bg = 'var(--color-surface-subtle)';
  let border = 'var(--color-border-subtle)';

  switch (state) {
    case 'submitting':
      icon = <RefreshCw size={13} className="spin-animation" />;
      text = 'Saving to server...';
      color = 'var(--color-primary)';
      bg = 'rgba(184, 80, 66, 0.08)';
      border = 'rgba(184, 80, 66, 0.2)';
      break;

    case 'saved':
      icon = <CheckCircle2 size={13} />;
      text = lastSavedTime ? `Saved to server (${lastSavedTime})` : 'Saved to server';
      color = 'var(--color-success)';
      bg = 'var(--color-success-bg)';
      border = 'rgba(45, 114, 82, 0.2)';
      break;

    case 'draft_local':
      icon = <CloudOff size={13} />;
      text = customMessage || 'Draft on this device — reconnect to submit';
      color = 'var(--color-warning)';
      bg = 'var(--color-warning-bg)';
      border = 'rgba(158, 103, 30, 0.25)';
      break;

    case 'stale_tab':
      icon = <AlertTriangle size={13} />;
      text = customMessage || 'Version conflict: session advanced in another tab';
      color = 'var(--color-error)';
      bg = 'var(--color-error-bg)';
      border = 'rgba(184, 56, 56, 0.25)';
      break;

    case 'draft_unsaved':
      icon = <Clock size={13} />;
      text = 'Unsaved draft on device';
      color = 'var(--color-text-secondary)';
      bg = 'var(--color-surface-subtle)';
      border = 'var(--color-border)';
      break;

    default:
      text = customMessage || '';
      break;
  }

  if (!text) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 500,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        transition: 'all var(--transition-fast)',
      }}
      role="status"
      aria-live="polite"
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
