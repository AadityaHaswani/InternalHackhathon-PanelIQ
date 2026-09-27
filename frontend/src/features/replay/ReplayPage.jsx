import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Users,
  Clock,
  PlayCircle,
  Shield,
  Briefcase,
  Award,
  Lock,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { TranscriptTurn } from './TranscriptTurn';
import { getSessionReplay } from '../reports/services/assessmentApi';

/**
 * ReplayPage - Boardroom Simulation Dialogue Replay
 * Styled with warm cream background, terracotta accents, and serif headings matching reference image.
 * Route: /app/interviews/:id/replay
 */
export function ReplayPage() {
  const { id } = useParams();
  const location = useLocation();

  const [replay, setReplay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [stageFilter, setStageFilter] = useState('all');
  const [speakerFilter, setSpeakerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedTurnId, setHighlightedTurnId] = useState(null);

  const fetchReplay = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessionReplay(id);
      if (!data) throw new Error('Replay data not found.');
      setReplay(data);
    } catch (err) {
      console.error('Failed to load replay timeline:', err);
      setError(err.message || 'Unable to load interview replay.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReplay();
  }, [id]);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      setHighlightedTurnId(targetId);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [location.hash, replay]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="2.5rem" width="40%" borderRadius="8px" />
        <Skeleton height="3rem" borderRadius="10px" />
        <Skeleton height="14rem" borderRadius="14px" />
        <Skeleton height="14rem" borderRadius="14px" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <ErrorState
          title="Could Not Load Replay Timeline"
          message={error}
          onRetry={fetchReplay}
        />
      </div>
    );
  }

  if (!replay) {
    return (
      <div style={{ maxWidth: '720px', margin: '3rem auto' }}>
        <EmptyState
          icon={<FileText size={40} />}
          title="Replay Transcript Not Found"
          description="We could not find an interview replay timeline for this session identifier."
          action={
            <Link to="/app">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const turns = replay.turns || [];

  const filteredTurns = turns.filter((turn) => {
    if (stageFilter !== 'all' && turn.stage !== stageFilter) {
      return false;
    }
    if (speakerFilter !== 'all' && turn.speakerRole !== speakerFilter) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const questionMatch = turn.question?.toLowerCase().includes(q);
      const answerMatch = turn.answer?.toLowerCase().includes(q);
      const speakerMatch = turn.speakerName?.toLowerCase().includes(q);
      if (!questionMatch && !answerMatch && !speakerMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-muted, #8C857B)' }}>
        <Link to={`/app/interviews/${id}/report`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted, #8C857B)' }}>
          <ArrowLeft size={14} />
          <span>Back to Scorecard Report</span>
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>Boardroom Replay</span>
      </div>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Boardroom Interview Replay
            </h1>
            <Badge variant="accent">
              <Lock size={12} style={{ marginRight: '4px' }} />
              Read-Only Timeline
            </Badge>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '0.375rem', margin: 0 }}>
            {replay.sessionTitle || `Session ${id}`} • Duration: {replay.duration || '33 mins'} • {turns.length} Dialog Turns
          </p>
        </div>

        <Link to={`/app/interviews/${id}/report`}>
          <Button variant="secondary" size="sm">
            View Scorecard Report
          </Button>
        </Link>
      </div>

      {/* Panelists Legend */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border, #E5DFD6)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Boardroom Panelists:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', color: 'var(--color-primary, #B85042)', fontWeight: 600 }}>
            <Award size={15} />
            <span>Dr. Aris Thorne (Panel Chair)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', color: 'var(--color-success, #2D7252)', fontWeight: 600 }}>
            <Shield size={15} />
            <span>Elena Rostova (Technical Specialist)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', color: 'var(--color-warning, #9E671E)', fontWeight: 600 }}>
            <Briefcase size={15} />
            <span>Marcus Vance (Project Evaluator)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border, #E5DFD6)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Stage Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)', marginRight: '0.25rem', fontWeight: 600 }}>
              Stage:
            </span>
            {[
              { id: 'all', label: 'All Stages' },
              { id: 'technical', label: 'Technical' },
              { id: 'techno_managerial', label: 'Managerial' },
              { id: 'reflection', label: 'Reflection' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStageFilter(st.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: stageFilter === st.id ? 600 : 500,
                  backgroundColor: stageFilter === st.id ? 'var(--color-primary, #B85042)' : 'var(--color-surface-subtle, #F3EFEA)',
                  color: stageFilter === st.id ? '#FFFFFF' : 'var(--color-text-secondary, #5E5953)',
                  border: stageFilter === st.id ? '1px solid var(--color-primary, #B85042)' : '1px solid var(--color-border, #E5DFD6)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Speaker Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600 }}>Speaker:</span>
            <select
              value={speakerFilter}
              onChange={(e) => setSpeakerFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #E5DFD6)',
                color: 'var(--color-text-main, #1A1816)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Panelists</option>
              <option value="chair">Panel Chair</option>
              <option value="specialist">Technical Specialist</option>
              <option value="evaluator">Project Evaluator</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted, #8C857B)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript by keyword, question topic, or candidate technical rationale..."
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              backgroundColor: 'var(--color-bg, #FAF7F2)',
              border: '1px solid var(--color-border, #E5DFD6)',
              borderRadius: '8px',
              color: 'var(--color-text-main, #1A1816)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Transcript Turns Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredTurns.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              borderRadius: '12px',
              border: '1px dashed var(--color-border, #E5DFD6)',
              textAlign: 'center',
              color: 'var(--color-text-muted, #8C857B)',
            }}
          >
            No boardroom transcript turns match your current filters.
          </div>
        ) : (
          filteredTurns.map((turn) => (
            <TranscriptTurn
              key={turn.id || turn.position}
              turn={turn}
              sessionId={id}
              isHighlighted={highlightedTurnId === `turn-${turn.position || turn.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ReplayPage;
