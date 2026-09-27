import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/**
 * AnswerComposer - Reusable, controlled text response composer for interview turns and retries.
 *
 * Dev 3 Handoff Contract:
 * - Export Path: 'frontend/src/features/interview/AnswerComposer.jsx'
 * - Controlled Component: Contains ZERO fetch logic. State is driven strictly by props.
 *
 * Props:
 * @param {string} value - Current text entered by candidate
 * @param {function(string)} onChange - Callback invoked on textarea text change
 * @param {function()} onSubmit - Callback invoked on submission click or Cmd+Enter / Ctrl+Enter
 * @param {boolean} disabled - Whether input and actions are disabled
 * @param {number} maxLength - Character threshold (backend enforces 2000 Unicode chars)
 * @param {'idle' | 'submitting' | 'saved' | 'reconnecting' | 'error'} submissionState - Current save state
 * @param {string} [placeholder] - Helpful prompt guidance
 * @param {string} [errorMessage] - Optional error description to display inline
 * @param {React.ReactNode} [actionsSlot] - Optional extra controls (e.g. Skip button)
 *
 * Example Usage for Dev 3 Retry:
 * ```jsx
 * import { AnswerComposer } from '../features/interview/AnswerComposer';
 *
 * function RetryTurn() {
 *   const [text, setText] = useState('');
 *   return (
 *     <AnswerComposer
 *       value={text}
 *       onChange={setText}
 *       onSubmit={handleRetrySubmit}
 *       disabled={isSubmitting}
 *       maxLength={2000}
 *       submissionState={isSubmitting ? 'submitting' : 'idle'}
 *       placeholder="Provide your revised, evidence-backed answer..."
 *     />
 *   );
 * }
 * ```
 */
export function AnswerComposer({
  value = '',
  onChange,
  onSubmit,
  disabled = false,
  maxLength = 2000,
  submissionState = 'idle',
  placeholder = 'Articulate your solution, architecture trade-offs, and technical rationale...',
  errorMessage = '',
  actionsSlot = null,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height to accommodate multi-paragraph responses
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(480, Math.max(160, el.scrollHeight))}px`;
    }
  }, [value]);

  const charCount = [...value].length;
  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;
  const isSubmitting = submissionState === 'submitting';
  const isReconnecting = submissionState === 'reconnecting';
  const isSaved = submissionState === 'saved';

  const handleKeyDown = (e) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) submits the response
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && !isSubmitting && value.trim().length > 0 && !isOverLimit) {
        onSubmit?.();
      }
    }
  };

  const handleChange = (e) => {
    const nextVal = e.target.value;
    onChange?.(nextVal);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <label
          htmlFor="interview-answer-input"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <span>Your Answer</span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--color-text-muted)' }}>
            (text-based technical simulation)
          </span>
        </label>

        {/* Character Counter */}
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-mono)',
            color: isOverLimit
              ? 'var(--color-error)'
              : isNearLimit
              ? 'var(--color-warning)'
              : 'var(--color-text-muted)',
            fontWeight: isNearLimit ? 600 : 400,
            transition: 'color var(--transition-fast)',
          }}
          aria-live="polite"
        >
          {charCount} / {maxLength}
        </div>
      </div>

      {/* Primary Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          id="interview-answer-input"
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          rows={6}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-card)',
            border: isOverLimit
              ? '2px solid var(--color-error)'
              : '1px solid var(--color-border)',
            backgroundColor: disabled ? 'var(--color-surface-subtle)' : 'var(--color-surface)',
            color: 'var(--color-text-main)',
            fontSize: 'var(--font-size-base)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            minHeight: '160px',
          }}
          aria-invalid={isOverLimit ? 'true' : undefined}
          aria-describedby={errorMessage ? 'answer-error-msg' : undefined}
        />
      </div>

      {/* Inline Error Notice */}
      {errorMessage && (
        <div
          id="answer-error-msg"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 500,
          }}
          role="alert"
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bottom Bar: Keyboard Hint + Status + Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.25rem',
        }}
      >
        {/* Keyboard shortcut guidance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <kbd
            style={{
              padding: '2px 5px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Ctrl + Enter
          </kbd>
          <span>to submit answer</span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {actionsSlot}

          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            disabled={disabled || isSubmitting || isReconnecting || value.trim().length === 0 || isOverLimit}
            isLoading={isSubmitting}
            leftIcon={
              isSaved ? (
                <CheckCircle2 size={16} />
              ) : isReconnecting ? (
                <RefreshCw size={16} className="spin-animation" />
              ) : (
                <Send size={16} />
              )
            }
          >
            {isSubmitting
              ? 'Saving to server...'
              : isReconnecting
              ? 'Reconnecting...'
              : isSaved
              ? 'Saved'
              : 'Submit Answer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
