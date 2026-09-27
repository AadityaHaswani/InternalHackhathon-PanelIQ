import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Info, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { apiClient } from '../../lib/api-client';
import { ErrorState } from '../../components/ui/ErrorState';

export function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [assignmentsRes, sessionsRes, evaluatorsRes] = await Promise.allSettled([
        apiClient.get('review-assignments?limit=50&offset=0'),
        apiClient.get('admin/sessions'),
        apiClient.get('admin/evaluators'),
      ]);

      if (assignmentsRes.status === 'fulfilled') {
        const list = assignmentsRes.value.data?.assignments;
        setAssignments(Array.isArray(list) ? list : []);
      } else {
        throw assignmentsRes.reason;
      }

      if (sessionsRes.status === 'fulfilled') {
        const sList = sessionsRes.value.data?.sessions;
        setCompletedSessions(Array.isArray(sList) ? sList : []);
      } else {
        setCompletedSessions([]);
      }

      if (evaluatorsRes.status === 'fulfilled') {
        const eList = evaluatorsRes.value.data?.evaluators;
        setEvaluators(Array.isArray(eList) ? eList : []);
      } else {
        setEvaluators([]);
      }
    } catch (err) {
      setLoadError(err);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (event) => {
    event.preventDefault();
    if (!selectedSessionId || !selectedEvaluatorId) {
      toast.error('Please select both a candidate session and an approved evaluator.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('admin/assignments', {
        sessionId: selectedSessionId,
        evaluatorId: selectedEvaluatorId,
      });
      toast.success('Assignment created successfully.');
      setSelectedSessionId('');
      setSelectedEvaluatorId('');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create review assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Session ID',
      key: 'sessionId',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
            {row.session_id || row.sessionId}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            ID: {(row.id || '').substring(0, 14)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Evaluator ID',
      key: 'evaluatorId',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
            {row.evaluator_id || row.evaluatorId || 'Assigned'}
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Date',
      key: 'assignedAt',
      render: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          {row.assigned_at || row.assignedAt ? new Date(row.assigned_at || row.assignedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
        </span>
      ),
    },
    {
      header: 'Review Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'reviewed' ? 'reviewed' : 'pending'}>
            {row.status === 'reviewed' ? 'Reviewed & Released' : row.status === 'pending' ? 'Pending Review' : 'Not provided'}
        </Badge>
      ),
    },
  ];

  const sessionOptions = [
    { value: '', label: completedSessions.length > 0 ? 'Select a candidate session...' : 'No eligible completed sessions' },
    ...completedSessions.map((s) => ({
      value: s.id || s.sessionId,
      label: `${s.profile?.displayName || 'Candidate'} — ${(s.id || s.sessionId).substring(0, 8)} (${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'})`,
    })),
  ];

  const evaluatorOptions = [
    { value: '', label: evaluators.length > 0 ? 'Select an approved evaluator...' : 'No approved evaluators available' },
    ...evaluators.map((e) => ({
      value: e.id || e.evaluatorId,
      label: `${e.displayName || 'Evaluator'} (${(e.id || e.evaluatorId || '').substring(0, 8)}...)`,
    })),
  ];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <PageHeader
        title="Evaluator Session Assignments"
        description="Assign completed candidate simulation sessions to qualified evaluators for human assessment and score verification."
      />

      {/* Backend Status Banner */}
      <div
        style={{
          padding: '1rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
      >
        <Info size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
            Assignments Backend Connected
          </div>
          <div>
            Review assignments are connected live to PostgreSQL. Completed candidate sessions are loaded from <code>GET /api/v1/admin/sessions</code>, approved evaluators from <code>GET /api/v1/admin/evaluators</code>, and new assignments are created via <code>POST /api/v1/admin/assignments</code>.
          </div>
        </div>
      </div>

      {/* Assignment Form Card */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <UserPlus size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Assign Completed Session</h2>
        </div>

        <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <Select
            label="Candidate session"
            options={sessionOptions}
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            disabled={completedSessions.length === 0 || isSubmitting}
            helperText={completedSessions.length > 0 ? 'Eligible completed 8-turn sessions' : 'No completed candidate sessions awaiting assignment'}
          />

          <Select
            label="Approved evaluator"
            options={evaluatorOptions}
            value={selectedEvaluatorId}
            onChange={(e) => setSelectedEvaluatorId(e.target.value)}
            disabled={evaluators.length === 0 || isSubmitting}
            helperText={evaluators.length > 0 ? 'Approved evaluators eligible for review' : 'No approved evaluators registered'}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!selectedSessionId || !selectedEvaluatorId || isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<UserPlus size={16} />}
          >
            Confirm Assignment
          </Button>
        </form>
      </div>

      {loadError && <ErrorState title="Assignments could not be loaded" message={loadError.message} code={loadError.code} onRetry={loadData} />}
      <Button variant="outline" onClick={loadData} isLoading={isLoading} leftIcon={<RefreshCw size={16} />}>Refresh assignments</Button>
      {/* Assignments Table */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
          Your Review Assignments ({assignments.length})
        </h2>

        <DataTable
          columns={columns}
          data={assignments}
          ariaLabel="Active review assignments table"
          emptyMessage={loadError ? 'Assignments could not be loaded. Retry above.' : isLoading ? 'Loading assignments...' : 'No review assignments were returned for your account.'}
        />
      </div>
    </div>
  );
}

export default AdminAssignmentsPage;
