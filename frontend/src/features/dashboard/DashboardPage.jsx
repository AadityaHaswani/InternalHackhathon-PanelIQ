import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RotateCw,
  PlusCircle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { MOCK_SESSIONS } from '../../mocks/dashboard/dashboard.fixtures';

export function DashboardPage() {
  const { user, profile, token, devMode } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSessionDetail, setActiveSessionDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFixtures, setIsUsingFixtures] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    if (token) {
      try {
        const response = await apiClient.get('sessions?limit=20&offset=0');
        const list = response?.data?.sessions || [];
        setSessions(list);
        setIsUsingFixtures(false);

        const active = list.find((s) => s.status === 'active');
        if (active) {
          try {
            const detailRes = await apiClient.get(`sessions/${active.id}`);
            setActiveSessionDetail(detailRes?.data?.session || null);
          } catch {
            setActiveSessionDetail(null);
          }
        } else {
          setActiveSessionDetail(null);
        }
      } catch (err) {
        if (devMode) {
          setSessions(MOCK_SESSIONS);
          setIsUsingFixtures(true);
        } else {
          setError(err);
          setSessions([]);
        }
      } finally {
        setIsLoading(false);
      }
    } else if (devMode) {
      setSessions(MOCK_SESSIONS);
      setIsUsingFixtures(true);
      setIsLoading(false);
    } else {
      setSessions([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token, devMode]);

  const activeSession = activeSessionDetail || sessions.find((s) => s.status === 'active');

  const columns = [
    {
      header: 'Session ID & Role',
      key: 'id',
      render: (row) => {
        const roleLabels = {
          backend_developer: 'Backend Developer',
          frontend_engineer: 'Frontend Engineer',
          fullstack_engineer: 'Full Stack Engineer',
          system_design_engineer: 'System Design Engineer',
          devops_cloud_engineer: 'DevOps / Cloud Engineer',
          data_engineer: 'Data Engineer',
          qa_automation_engineer: 'QA / Automation Engineer',
        };
        const roleName = roleLabels[row.profile?.targetRole] || (row.profile?.targetRole ? row.profile.targetRole.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Backend Developer');
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {roleName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {row.id.substring(0, 18)}...
            </div>
          </div>
        );
      },
    },
    {
      header: 'Level',
      key: 'level',
      render: (row) => (
        <span style={{ textTransform: 'capitalize' }}>
          {row.profile?.experienceLevel || 'Junior'}
        </span>
      ),
    },
    {
      header: 'Progress',
      key: 'progress',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '80px',
              height: '6px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(row.answeredCount / row.totalTurns) * 100}%`,
                height: '100%',
                backgroundColor: row.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)',
              }}
            />
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            {row.answeredCount}/{row.totalTurns} turns
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        row.status === 'completed' ? (
          row.isReportReleased ? (
            <Badge variant="reviewed">Completed / Released</Badge>
          ) : (
            <Badge variant="reviewed">Completed</Badge>
          )
        ) : (
          <Badge variant="pending">In Progress</Badge>
        )
      ),
    },
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          {new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (row) => (
        row.status === 'active' ? (
          <Link to={`/app/interviews/${row.id}`}>
            <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} />}>
              Resume
            </Button>
          </Link>
        ) : (
          <Link to={`/app/interviews/${row.id}/report`}>
            <Button size="sm" variant="outline" rightIcon={<ChevronRight size={14} />}>
              View Report
            </Button>
          </Link>
        )
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.displayName || user?.email?.split('@')[0] || 'Candidate'}`}
        description="Track your simulation practice, resume incomplete sessions, or start a new technical boardroom interview."
        actions={
          <Link to="/app/interviews/new">
            <Button variant="primary" leftIcon={<PlusCircle size={16} />}>
              New Practice Session
            </Button>
          </Link>
        }
      />

      {/* Contract fixture disclaimer banner */}
      {isUsingFixtures && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="accent">DEVELOPMENT FIXTURE</Badge>
            <span>Showing verified contract-backed session fixtures (local backend disconnected or unseeded).</span>
          </div>
          <button
            onClick={fetchSessions}
            style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', minHeight: '36px' }}
          >
            <RotateCw size={12} /> Retry Live API
          </button>
        </div>
      )}

      {/* Active Session Highlight Card */}
      {activeSession && (
        <div
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-primary)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: 'var(--color-primary)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <Badge variant="accent">ACTIVE INTERVIEW IN PROGRESS</Badge>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Started {new Date(activeSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.375rem' }}>
                {activeSession.profile?.targetRole === 'backend_developer' ? 'Backend Developer' : activeSession.profile?.targetRole} — Simulation
              </h2>

              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Current turn: <strong>Turn {activeSession.answeredCount + 1} of {activeSession.totalTurns}</strong> ({activeSession.currentTurn?.stage || 'technical'} stage)
              </p>

              {activeSession.currentTurn?.prompt && (
                <div
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-main)',
                    fontFamily: 'var(--font-serif)',
                    lineHeight: 1.5,
                    maxWidth: '720px',
                    borderLeft: '2px solid var(--color-primary)',
                  }}
                >
                  "{activeSession.currentTurn.prompt}"
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Link to={`/app/interviews/${activeSession.id}`}>
                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                  Resume Boardroom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Session History Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-main)' }}>
            Session History
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {sessions.length} recorded session{sessions.length === 1 ? '' : 's'}
          </span>
        </div>

        {error ? (
          <ErrorState
            title="Unable to load session history"
            message={error.message}
            code={error.code}
            requestId={error.requestId}
            onRetry={fetchSessions}
          />
        ) : (
          <DataTable
            columns={columns}
            data={sessions}
            isLoading={isLoading}
            ariaLabel="Session history table"
            emptyMessage="You have not completed any interview simulations yet. Click 'New Practice Session' to begin your first attempt."
          />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
