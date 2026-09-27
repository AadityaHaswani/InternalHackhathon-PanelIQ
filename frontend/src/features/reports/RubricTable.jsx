import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

/**
 * RubricTable - Tabular breakdown of calibrated rubric criteria vs candidate demonstration
 * Warm editorial table matching reference image design.
 */
export function RubricTable({ criteria = [], isPending = false }) {
  const defaultCriteriaData = [
    {
      id: 'correctness',
      name: 'Technical Correctness',
      weight: '35%',
      descriptor: 'Factual accuracy of database concurrency, HTTP status codes, isolation levels, and data structures.',
      levels: {
        below: 'Frequent syntax/concurrency errors; proposes unsafe TOCTOU patterns.',
        proficient: 'Selects correct constraints (e.g. UNIQUE index, row locks, RFC status codes).',
        exemplary: 'Deep mechanical knowledge of engine transaction locks, rollback invariants, and failure modes.',
      },
    },
    {
      id: 'reasoning',
      name: 'Architectural Reasoning',
      weight: '25%',
      descriptor: 'Defensible rationale for choosing specific storage engines, API patterns, and caching tiers.',
      levels: {
        below: 'Cannot explain why a design choice was made beyond default framework tutorials.',
        proficient: 'Articulates clear pros/cons for PostgreSQL locking and transactional guarantees.',
        exemplary: 'Addresses distributed failure boundaries, partition keys, and CQRS tradeoffs under scale.',
      },
    },
    {
      id: 'relevance',
      name: 'Direct Relevance',
      weight: '20%',
      descriptor: 'Answering the exact problem constraints without evading the question or tangents.',
      levels: {
        below: 'Dodges core challenge; shifts topic to unrelated libraries.',
        proficient: 'Directly answers the scenario prompt within requested constraints.',
        exemplary: 'Direct, crisp, and systematically unpacks each explicit and implicit prompt requirement.',
      },
    },
    {
      id: 'tradeoffs',
      name: 'Trade-offs & Application',
      weight: '20%',
      descriptor: 'Pragmatic operational triage, handling client retry storms, and engineering deadline prioritization.',
      levels: {
        below: 'Fails to recognize duplicate charge hazards or refuses to scope features under deadline.',
        proficient: 'Prioritizes persistence over UI; understands basic idempotency concepts.',
        exemplary: 'Rigorously defines idempotency keys, leased locks, and zero-data-loss rollback pipelines.',
      },
    },
  ];

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-card, 14px)',
        border: '1px solid var(--color-border, #E5DFD6)',
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-surface-subtle, #F3EFEA)',
              borderBottom: '1px solid var(--color-border, #E5DFD6)',
              color: 'var(--color-text-secondary, #5E5953)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <th style={{ padding: '0.875rem 1rem', width: '24%' }}>Criterion & Weight</th>
            <th style={{ padding: '0.875rem 1rem', width: '38%' }}>Target Level Definition</th>
            <th style={{ padding: '0.875rem 1rem', width: '20%' }}>Candidate Score</th>
            <th style={{ padding: '0.875rem 1rem', width: '18%' }}>Assessment Status</th>
          </tr>
        </thead>
        <tbody>
          {defaultCriteriaData.map((item, index) => {
            const candidateCriterion = criteria.find((c) => c.id === item.id);
            const score = candidateCriterion?.score;
            const itemPending = isPending || candidateCriterion?.isPending;

            const isExemplary = score >= 3.6;
            const isProficient = score >= 2.5 && score < 3.6;
            const isBelow = score !== undefined && score < 2.5;

            return (
              <tr
                key={item.id}
                style={{
                  borderBottom: index < defaultCriteriaData.length - 1 ? '1px solid var(--color-border-subtle, #EFECE6)' : 'none',
                  backgroundColor: index % 2 === 1 ? 'rgba(243, 239, 234, 0.35)' : '#FFFFFF',
                }}
              >
                {/* Criterion name & weight */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)', fontSize: '15px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-primary, #B85042)', fontWeight: 600, marginTop: '2px' }}>
                    Weight: {item.weight}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '6px', lineHeight: 1.4 }}>
                    {item.descriptor}
                  </div>
                </td>

                {/* Level definition */}
                <td style={{ padding: '1rem', verticalAlign: 'top', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success, #2D7252)' }}>
                      Proficient (2.5 - 3.5):
                    </span>{' '}
                    <span>{item.levels.proficient}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary, #B85042)' }}>
                      Exemplary (3.6 - 4.0):
                    </span>{' '}
                    <span>{item.levels.exemplary}</span>
                  </div>
                </td>

                {/* Score */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  {itemPending ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--color-warning, #9E671E)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                      className="dev3-pulse"
                    >
                      <Clock size={14} />
                      <span>Pending calibration</span>
                    </div>
                  ) : score !== undefined ? (
                    <div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono, monospace)',
                          color: isExemplary ? 'var(--color-success, #2D7252)' : isProficient ? 'var(--color-primary, #B85042)' : 'var(--color-error, #B83838)',
                        }}
                      >
                        {score.toFixed(1)}{' '}
                        <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted, #8C857B)' }}>/ 4.0</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', marginTop: '2px' }}>
                        {isExemplary ? 'Exceeds Standard' : isProficient ? 'Meets Standard' : 'Requires Remediation'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted, #8C857B)', fontSize: '12px' }}>Not evaluated</span>
                  )}
                </td>

                {/* Status */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  {itemPending ? (
                    <Badge variant="pending" icon={<Clock size={12} />}>
                      Pending
                    </Badge>
                  ) : isExemplary ? (
                    <Badge variant="reviewed" icon={<CheckCircle2 size={12} />}>
                      Exemplary
                    </Badge>
                  ) : isProficient ? (
                    <Badge variant="reviewed" icon={<ShieldCheck size={12} />}>
                      Proficient
                    </Badge>
                  ) : (
                    <Badge variant="danger" icon={<AlertCircle size={12} />}>
                      Skill Gap
                    </Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RubricTable;
