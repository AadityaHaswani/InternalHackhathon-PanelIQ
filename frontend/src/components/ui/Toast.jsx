import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast({ type: 'success', message: msg, duration: dur }),
    error: (msg, dur) => addToast({ type: 'error', message: msg, duration: dur }),
    warning: (msg, dur) => addToast({ type: 'warning', message: msg, duration: dur }),
    info: (msg, dur) => addToast({ type: 'info', message: msg, duration: dur }),
  };

  const icons = {
    success: <CheckCircle2 size={16} color="var(--color-success)" />,
    error: <AlertCircle size={16} color="var(--color-error)" />,
    warning: <AlertTriangle size={16} color="var(--color-warning)" />,
    info: <Info size={16} color="var(--color-info)" />,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100% - 3rem)',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-elevated)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-main)',
              animation: 'slideUp 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {icons[t.type]}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss toast"
              style={{
                color: 'var(--color-text-muted)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default useToast;
