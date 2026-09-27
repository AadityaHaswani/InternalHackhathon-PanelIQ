import React, { useEffect, useRef } from 'react';
import { X, Quote, ShieldCheck, AlertTriangle, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

/**
 * EvidenceDrawer - Reusable Side Drawer for Ground-Truth Evaluative Evidence
 * Styled with warm cream surfaces, terracotta accents, and elegant serif headings.
 */
export function EvidenceDrawer({
  isOpen = false,
  onClose,
  evidence = null,
  turnPosition = null,
  sessionId = null,
  questionPrompt = null,
  onJumpToTurn,
}) {
  const drawerRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJumpToReplay = () => {
    if (onJumpToTurn) {
      onJumpToTurn(turnPosition);
      onClose?.();
    } else if (sessionId) {
      navigate(`/app/interviews/${sessionId}/replay#turn-${turnPosition || 1}`);
      onClose?.();
    }
  };

  const excerpt = evidence?.excerpt;
  const criterion = evidence?.criterion || 'Technical Accuracy & Reasoning';
  const explanation = evidence?.explanation || 'Direct correlation established between answer excerpt and calibrated rubric parameters.';
  const missingPoints = evidence?.missingPoints || [];
  const source = evidence?.source || 'Calibrated Boardroom Rubric';

  return (
    <div
      className="dev3-drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-drawer-title"
    >
      <div
        ref={drawerRef}
        className="dev3-drawer-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--color-bg, #FAF7F2)',
          borderLeft: '1px solid var(--color-border, #E5DFD6)',
          boxShadow: 'var(--dev3-shadow-drawer)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border, #E5DFD6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary, #B85042)',
              }}
            >
              <Quote size={18} />
            </div>
            <div>
              <h2
                id="evidence-drawer-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-text-main, #1A1816)',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Verifiable Answer Evidence
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>
                {turnPosition ? `Turn #${turnPosition} Boardroom Audit` : 'Ground-Truth Verification'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close evidence drawer"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary, #5E5953)',
              backgroundColor: 'var(--color-surface-subtle, #F3EFEA)',
              border: '1px solid var(--color-border, #E5DFD6)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            className="dev3-interactive"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Question Context Banner */}
          {questionPrompt && (
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #E5DFD6)',
                borderRadius: 'var(--radius-control, 8px)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-primary, #B85042)',
                  marginBottom: '0.375rem',
                }}
              >
                Interviewer Question
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-main, #1A1816)', lineHeight: 1.5, margin: 0 }}>
                {questionPrompt}
              </p>
            </div>
          )}

          {/* Criterion & Source Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              borderRadius: 'var(--radius-control, 8px)',
              border: '1px solid var(--color-border, #E5DFD6)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600 }}>
                Evaluated Criterion
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-primary, #B85042)', marginTop: '2px' }}>
                {criterion}
              </div>
            </div>

            <Badge variant="reviewed" icon={<ShieldCheck size={13} />}>
              {source}
            </Badge>
          </div>

          {/* Highlighted Verbatim Excerpt */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-main, #1A1816)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Sparkles size={14} color="var(--color-primary, #B85042)" />
              <span>Verbatim Excerpt from Candidate Answer</span>
            </div>

            {excerpt ? (
              <div className="dev3-quote-highlight" style={{ fontSize: '13px' }}>
                “{excerpt}”
              </div>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface, #FFFFFF)',
                  border: '1px dashed var(--color-border, #E5DFD6)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--color-text-muted, #8C857B)',
                  fontStyle: 'italic',
                }}
              >
                No single contiguous excerpt isolated. Full answer was evaluated across broader structural coherence.
              </div>
            )}
          </div>

          {/* Evaluative Explanation */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-main, #1A1816)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <BookOpen size={14} color="#2D7252" />
              <span>Evaluative Assessment & Rationale</span>
            </div>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #E5DFD6)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--color-text-secondary, #5E5953)',
                lineHeight: 1.6,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {explanation}
            </div>
          </div>

          {/* Missing Points / Gaps */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#9E671E',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <AlertTriangle size={14} color="#9E671E" />
              <span>Omissions & Leveling Gaps</span>
            </div>

            {missingPoints && missingPoints.length > 0 ? (
              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '0.875rem 1rem 0.875rem 2rem',
                  backgroundColor: '#FAF2E6',
                  border: '1px solid rgba(158, 103, 30, 0.25)',
                  borderRadius: '8px',
                  margin: 0,
                  fontSize: '13px',
                  color: '#9E671E',
                  lineHeight: 1.5,
                }}
              >
                {missingPoints.map((point, idx) => (
                  <li key={idx}>
                    <span style={{ color: 'var(--color-text-main, #1A1816)' }}>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#EBF4EF',
                  border: '1px solid rgba(45, 114, 82, 0.25)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#2D7252',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <ShieldCheck size={14} />
                <span>Zero critical omissions identified for this level. Answer met or exceeded expectations.</span>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer with Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border, #E5DFD6)',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Drawer
          </Button>

          {turnPosition && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleJumpToReplay}
              rightIcon={<ArrowRight size={14} />}
            >
              Jump to Replay Turn #{turnPosition}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvidenceDrawer;
