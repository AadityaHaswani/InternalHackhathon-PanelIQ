import React, { useState } from 'react';
import { UserPlus, Info } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import { MOCK_ASSIGNMENTS, MOCK_EVALUATORS } from '../../mocks/admin/admin.fixtures';
import { MOCK_SESSIONS } from '../../mocks/dashboard/dashboard.fixtures';

export function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [selectedSessionId, setSelectedSessionId] = useState(MOCK_SESSIONS[1]?.id || '');
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState(MOCK_EVALUATORS[0]?.id || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const toast = useToast();

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedSessionId || !selectedEvaluatorId) {
      toast.error('Please select both a session and an evaluator.');
      return;
    }

    // Duplicate check
    const isDuplicate = assignments.some(
      (a) => a.sessionId === selectedSessionId && a.evaluatorId === selectedEvaluatorId
    );

    if (isDuplicate) {
      toast.warning('This evaluator is already assigned to this candidate session.');
      return;
    }

    setIsAssigning(true);

    const evaluator = MOCK_EVALUATORS.find((e) => e.id === selectedEvaluatorId);
    const session = MOCK_SESSIONS.find((s) => s.id === selectedSessionId);

    setTimeout(() => {
      const newAssignment = {
        id: `asg_${Date.now()}`,
        sessionId: selectedSessionId,
        candidateName: session?.profile?.displayName || 'Alex Chen',
        evaluatorId: selectedEvaluatorId,
        evaluatorName: evaluator?.name || 'Assigned Evaluator',
        role: 'Backend Developer',
        status: 'pending_review',
        assignedAt: new Date().toISOString(),
      };

      setAssignments([newAssignment, ...assignments]);
      setIsAssigning(false);
      toast.success(`Session assigned to ${evaluator?.name}`);
    }, 400);
  };

  const columns = [
    {
      header: 'Session',
      key: 'sessionId',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.candidateName}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            {row.sessionId.substring(0, 18)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Evaluator',
      key: 'evaluatorName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.evaluatorName}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ID: {row.evaluatorId}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Date',
      key: 'assignedAt',
      render: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          {new Date(row.assignedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Review Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'reviewed' ? 'reviewed' : 'pending'}>
          {row.status === 'reviewed' ? 'Reviewed & Released' : 'Pending Review'}
        </Badge>
      ),
    },
  ];

  const sessionOptions = MOCK_SESSIONS.filter((s) => s.status === 'completed').map((s) => ({
    value: s.id,
    label: `${s.profile.displayName} — ${s.id.substring(0, 8)} (${new Date(s.createdAt).toLocaleDateString()})`,
  }));

  const evaluatorOptions = MOCK_EVALUATORS.map((e) => ({
    value: e.id,
    label: `${e.name} (${e.specialty})`,
  }));

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
            Backend API Contract Status (Dev 4 Handoff)
          </div>
          <div>
            Evaluator assignment endpoints (`/api/v1/admin/assignments`) and role-based assignment tables are scheduled for Dev 4 (Tasks 7 and 11). Exercising local contract-backed simulation below with duplicate assignment prevention.
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
            helperText="Only completed 8-turn sessions eligible"
          />

          <Select
            label="Approved evaluator"
            options={evaluatorOptions}
            value={selectedEvaluatorId}
            onChange={(e) => setSelectedEvaluatorId(e.target.value)}
            helperText="Evaluator will receive private review access"
          />

          <Button type="submit" variant="primary" isLoading={isAssigning} leftIcon={<UserPlus size={16} />}>
            Confirm Assignment
          </Button>
        </form>
      </div>

      {/* Assignments Table */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
          Active Review Assignments ({assignments.length})
        </h2>

        <DataTable
          columns={columns}
          data={assignments}
          ariaLabel="Active review assignments table"
          emptyMessage="No evaluators have been assigned to candidate sessions yet."
        />
      </div>
    </div>
  );
}

export default AdminAssignmentsPage;
