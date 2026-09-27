import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  ChevronRight,
  Sparkles,
  Clock,
  Shield,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';

export function EvaluatorQueuePage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Backend contract: GET /api/v1/review-assignments?limit=20&offset=0
      const response = await apiClient.get('review-assignments?limit=20&offset=0');
      const list = response.data?.assignments || [];
      setAssignments(list);
    } catch (err) {
      setError({
        code: err.code || 'ASSIGNMENTS_LOAD_FAILED',
        message: err.message || 'Failed to load assigned candidate sessions.',
        requestId: err.requestId,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const columns = [
    {
      header: 'Session ID',
      key: 'session_id',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
            {row.session_id}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Assignment: {row.id?.substring(0, 14)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Date',
      key: 'assigned_at',
      render: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          {new Date(row.assigned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: () => (
        <Badge variant="pending">Pending Evaluation / Release</Badge>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (row) => (
        <Link to={`/expert/sessions/${row.session_id}`}>
          <Button size="sm" variant="primary" rightIcon={<ChevronRight size={14} />}>
            Review Session
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        title="Evaluator Review Queue"
        description="Inspect candidate transcripts against verified quotes, calibrate rubric ratings, and release official evaluation reports."
        actions={
          <Link to="/expert/question-lab">
            <Button variant="outline" size="sm" leftIcon={<Sparkles size={14} />}>
              Question Lab Sandbox
            </Button>
          </Link>
        }
      />

      {/* Review Guidelines Notice */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        <Shield size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-text-main)' }}>Evaluator Authority Boundary:</strong> You have authorization to inspect AI-generated evidence proposals, apply justified score overrides with an audit trail, and release immutable report revisions to candidates.
        </div>
      </div>

      {/* Assignments Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
            Assigned Candidate Sessions ({assignments.length})
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Signed in as {role}
          </span>
        </div>

        {error ? (
          <ErrorState
            title="Unable to load review assignments"
            message={error.message}
            code={error.code}
            requestId={error.requestId}
            onRetry={fetchAssignments}
          />
        ) : (
          <DataTable
            columns={columns}
            data={assignments}
            isLoading={isLoading}
            ariaLabel="Assigned candidate sessions"
            emptyMessage="No candidate sessions are currently assigned to you for review. Completed sessions assigned to your evaluator ID will appear here."
          />
        )}
      </div>
    </div>
  );
}

export default EvaluatorQueuePage;
