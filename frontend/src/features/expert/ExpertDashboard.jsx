import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  FlaskConical,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpertSessionCard } from './ExpertSessionCard';
import { getReviewAssignments } from '../reports/services/assessmentApi';

/**
 * ExpertDashboard - Reviewer Workspace & Calibration Queue
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 * Route: /expert
 */
export function ExpertDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReviewAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load review assignments:', err);
      setError(err.message || 'Unable to load reviewer queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const totalAssigned = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === 'draft' || a.status === 'pending').length;
  const completedCount = assignments.filter((a) => a.status === 'reviewed' || a.status === 'human_reviewed').length;

  const filteredAssignments = assignments.filter((item) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'reviewed' && item.status !== 'reviewed' && item.status !== 'human_reviewed') {
        return false;
      }
      if (statusFilter === 'draft' && item.status !== 'draft') {
        return false;
      }
      if (statusFilter === 'pending' && item.status !== 'pending') {
        return false;
      }
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.candidate?.name?.toLowerCase().includes(q);
      const roleMatch = item.candidate?.role?.toLowerCase().includes(q);
      const idMatch = item.sessionId?.toLowerCase().includes(q);
      if (!nameMatch && !roleMatch && !idMatch) return false;
    }

    return true;
  });

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
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
              Expert Review Workspace
            </h1>
            <Badge variant="reviewed">
              <ShieldCheck size={12} style={{ marginRight: '4px' }} />
              Authoritative Sign-off
            </Badge>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '0.375rem', margin: 0 }}>
            Inspect transcript evidence, calibrate automated AI scores, and release certified reports to candidates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssignments}
            leftIcon={<RefreshCw size={14} />}
          >
            Refresh Queue
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/expert/question-lab')}
            leftIcon={<FlaskConical size={15} />}
          >
            Open Question Lab
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Assigned */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(184, 80, 66, 0.08)',
              color: 'var(--color-primary, #B85042)',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>
              Assigned Sessions
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-text-main, #1A1816)' }}>
              {totalAssigned}
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#FAF2E6',
              color: 'var(--color-warning, #9E671E)',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>
              Awaiting Certification
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-warning, #9E671E)' }}>
              {pendingCount}
            </div>
          </div>
        </div>

        {/* Completed Sign-offs */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#EBF4EF',
              color: 'var(--color-success, #2D7252)',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>
              Certified & Released
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-success, #2D7252)' }}>
              {completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Status Tab Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${totalAssigned})` },
              { id: 'draft', label: 'AI Drafts' },
              { id: 'pending', label: 'Pending Grading' },
              { id: 'reviewed', label: `Completed (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.4rem 0.875rem',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: statusFilter === tab.id ? 600 : 500,
                  backgroundColor: statusFilter === tab.id ? 'var(--color-primary, #B85042)' : 'var(--color-surface-subtle, #F3EFEA)',
                  color: statusFilter === tab.id ? '#FFFFFF' : 'var(--color-text-secondary, #5E5953)',
                  border: statusFilter === tab.id ? '1px solid var(--color-primary, #B85042)' : '1px solid var(--color-border, #E5DFD6)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)' }}>
            Showing {filteredAssignments.length} session{filteredAssignments.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Search Bar */}
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
            placeholder="Filter queue by candidate name, target role, or session identifier..."
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

      {/* Queue Items */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="7rem" borderRadius="14px" />
          <Skeleton height="7rem" borderRadius="14px" />
          <Skeleton height="7rem" borderRadius="14px" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could Not Load Evaluator Assignments"
          message={error}
          onRetry={fetchAssignments}
        />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={40} />}
          title="No Sessions in Queue"
          description="There are currently no interview sessions matching your selected review filter."
          action={
            <Button variant="outline" size="sm" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredAssignments.map((asg) => (
            <ExpertSessionCard key={asg.id || asg.sessionId} assignment={asg} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpertDashboard;
