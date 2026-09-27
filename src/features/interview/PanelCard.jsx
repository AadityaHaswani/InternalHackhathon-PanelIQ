import React from 'react';
import { UserCheck, Shield, Cpu, Briefcase } from 'lucide-react';

/**
 * Panel roles supported in the PanelIQ simulation:
 * - chair: Panel Chair (Icebreakers, Reflection, Strategic oversight)
 * - specialist / technical: Technical Specialist (APIs, DBs, Concurrency, Reliability)
 * - evaluator / project: Project Evaluator (Trade-offs, Deadline pressures, Contracts)
 */
export const PANEL_MEMBERS = {
  chair: {
    id: 'chair',
    name: 'Evelyn Vance',
    role: 'Panel Chair',
    title: 'VP of Engineering',
    domain: 'Architecture & Leadership',
    avatarBg: '#2B5E86',
    icon: Shield,
    description: 'Guides session flow, sets stage context, and evaluates architectural maturity.',
  },
  specialist: {
    id: 'specialist',
    name: 'Marcus Thorne',
    role: 'Technical Specialist',
    title: 'Principal Systems Architect',
    domain: 'Distributed Systems & Data',
    avatarBg: '#B85042',
    icon: Cpu,
    description: 'Probes database transactions, concurrency hazards, and API resilience.',
  },
  evaluator: {
    id: 'evaluator',
    name: 'Clara Rios',
    role: 'Project Evaluator',
    title: 'Staff Engineering Lead',
    domain: 'Delivery & Trade-offs',
    avatarBg: '#9E671E',
    icon: Briefcase,
    description: 'Examines pragmatic trade-offs, scope negotiation, and real-world incidents.',
  },
};

/**
 * Normalizes backend panelRole strings ('chair', 'technical', 'specialist', 'project', 'evaluator')
 */
export function normalizePanelRole(roleString) {
  if (!roleString) return 'chair';
  const lower = roleString.toLowerCase();
  if (lower.includes('tech') || lower.includes('specialist')) return 'specialist';
  if (lower.includes('proj') || lower.includes('evaluator') || lower.includes('manager')) return 'evaluator';
  return 'chair';
}

/**
 * PanelCard - Displays one simulated evaluator in the text boardroom
 */
export function PanelCard({ role = 'chair', isActive = false, isCompact = false }) {
  const normalizedKey = normalizePanelRole(role);
  const member = PANEL_MEMBERS[normalizedKey] || PANEL_MEMBERS.chair;
  const IconComponent = member.icon;

  if (isCompact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-control)',
          backgroundColor: isActive ? 'var(--color-surface)' : 'var(--color-surface-subtle)',
          border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
          transition: 'all var(--transition-fast)',
          boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: member.avatarBg,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '11px',
            fontWeight: 700,
          }}
          aria-hidden="true"
        >
          <IconComponent size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {member.name}
            </span>
            {isActive && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-warning-bg)',
                  padding: '1px 4px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                Speaking
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {member.role}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: '220px',
        padding: '1rem',
        borderRadius: 'var(--radius-card)',
        backgroundColor: isActive ? 'var(--color-surface)' : 'var(--color-surface-subtle)',
        border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        boxShadow: isActive ? 'var(--shadow-card)' : 'none',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
      }}
      aria-current={isActive ? 'true' : undefined}
    >
      {/* Active speaker banner / badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: member.avatarBg,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-hidden="true"
          >
            <IconComponent size={18} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
              {member.name}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {member.title}
            </div>
          </div>
        </div>

        {isActive ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 'rgba(184, 80, 66, 0.1)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(184, 80, 66, 0.25)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                animation: 'pulse 1.5s infinite',
              }}
            />
            Asking Prompt
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {member.role}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.45,
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '0.5rem',
        }}
      >
        {member.description}
      </div>
    </div>
  );
}
