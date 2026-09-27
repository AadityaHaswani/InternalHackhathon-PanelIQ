import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { apiClient, ApiClientError } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';

const ROLE_LABELS = {
  backend_developer: 'Backend Developer',
  frontend_engineer: 'Frontend Engineer',
  fullstack_engineer: 'Full Stack Engineer',
  system_design_engineer: 'System Design Engineer',
  devops_cloud_engineer: 'DevOps / Cloud Engineer',
  data_engineer: 'Data Engineer',
  qa_automation_engineer: 'QA / Automation Engineer',
};

function formatRole(role) {
  if (!role) return 'Technical Interview';
  return ROLE_LABELS[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CandidateReportPage() {
  const { id: sessionId } = useParams();
  const { token, role } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingReview, setIsPendingReview] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsPendingReview(false);
    setReport(null);
    setSession(null);

    // Fetch session details for role and identity isolation
    try {
      const sRes = await apiClient.get(`sessions/${sessionId}`);
      if (sRes?.data?.session) {
        setSession(sRes.data.session);
      }
    } catch {
      // Proceed even if session metadata is unavailable
    }

    try {
      // Backend contract: GET /api/v1/sessions/:id/report
      const response = await apiClient.get(`sessions/${sessionId}/report`);
      setReport(response.data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        // Backend returns 403 REPORT_NOT_RELEASED when report is pending evaluator release
        if (err.status === 403 && (err.code === 'REPORT_NOT_RELEASED' || err.message?.includes('not been released'))) {
          setIsPendingReview(true);
        } else {
          setError(err);
        }
      } else {
        setError({
          code: 'REPORT_LOAD_ERROR',
          message: err.message || 'Failed to load candidate scorecard',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const rawRole = report?.profile?.targetRole || session?.profile?.targetRole || session?.profile_snapshot?.targetRole;
  const roleTitle = formatRole(rawRole);
  const candidateName = session?.profile?.displayName || report?.profile?.displayName || 'Candidate';

  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" />
        <Skeleton height="180px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Skeleton height="140px" />
          <Skeleton height="140px" />
        </div>
      </div>
    );
  }

  // Pending Evaluator Review State (Contractual 403 REPORT_NOT_RELEASED)
  if (isPendingReview) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div
          style={{
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={32} />
          </div>

          <div>
            <Badge variant="pending" style={{ marginBottom: '0.75rem' }}>
              Evaluation in Progress
            </Badge>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                margin: '0 0 0.5rem 0',
              }}
            >
              {roleTitle} Interview Submitted for Review
            </h1>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                margin: '0 0 0.75rem 0',
              }}
            >
              Session ID: {sessionId}
            </p>
            <p
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                maxWidth: '560px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              All 8 boardroom responses have been durably recorded on the server. Your {roleTitle} transcript is currently being reviewed by an authorized evaluator against official rubric anchors.
            </p>
          </div>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              maxWidth: '520px',
              textAlign: 'left',
              lineHeight: 1.6,
            }}
          >
            <strong>Evidence-Linked Integrity:</strong> To prevent unverified claims or algorithmic hallucinations, official scores and feedback are released only after human verification.
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Link to={`/app/interviews/${sessionId}/replay`}>
              <Button variant="secondary" leftIcon={<FileText size={16} />}>
                View Interview Transcript
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
            {(role === 'evaluator' || role === 'admin') && (
              <Link to={`/expert/sessions/${sessionId}`}>
                <Button variant="outline" rightIcon={<ExternalLink size={14} />}>
                  Open in Evaluator Workspace
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <ErrorState
          title="Unable to load interview report"
          message={error.message}
          code={error.code}
          requestId={error.requestId}
          onRetry={fetchReport}
        />
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/app">
            <Button variant="outline" leftIcon={<ArrowLeft size={14} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = report?.overallScore ?? null;
  const isReleased = (report?.status ?? report?.reportStatus) === 'released';
  const isProvisional = report?.isProvisional === true;
  const coverage = report?.coverageDiagnostics;
  const evaluatedCount = report?.evaluatedCount ?? coverage?.evaluatedAnswers;
  const requiredCount = report?.requiredCount ?? coverage?.requiredScoredAnswers;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Navigation header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/app/interviews/${sessionId}/replay`}>
            <Button variant="outline" size="sm" leftIcon={<FileText size={14} />}>
              View Full Transcript
            </Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title={`${roleTitle} Performance Scorecard`}
        description={`Official evaluation report for ${candidateName}, grounded in genuine evidence from boardroom simulation turns.`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {sessionId.substring(0, 8)}...
            </span>
            <Badge variant={isReleased ? 'reviewed' : 'pending'}>
              {isReleased ? `Released (Revision ${report.revision ?? report.currentRevision ?? 1})` : isProvisional ? 'Provisional Report' : 'Draft Report'}
            </Badge>
          </div>
        }
      />

      {/* Main Scorecard Overview Card */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--color-primary)" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
              {isProvisional ? 'Provisional Composite Score' : isReleased ? 'Final Composite Score' : 'Composite Score'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1 }}>
              {overallScore !== null ? overallScore : '--'}
            </span>
            <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}>/ 100</span>
          </div>

          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {overallScore === null && coverage?.pendingEvaluations > 0
              ? `No aggregate is available yet. ${coverage.pendingEvaluations} scored answers are awaiting complete evaluations.`
              : overallScore !== null && isProvisional
                ? 'Backend-provided provisional aggregate. Required evaluations are still pending.'
                : 'Aggregate provided by the backend evaluation report.'}
          </p>
        </div>

        {report?.releasedAt && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={16} color="var(--color-success)" />
              <span>Verified Report Revision</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Released on {new Date(report.releasedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {report.summary && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                "{report.summary}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Coverage Diagnostics */}
      {report?.coverageDiagnostics && (
        <div
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
            Curriculum & Topic Coverage
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Scored Answers Submitted
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                {coverage.completedScoredAnswers ?? '--'} / {requiredCount ?? '--'}
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Scored Answers Evaluated
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                {evaluatedCount ?? '--'} / {requiredCount ?? '--'}
              </div>
            </div>
          </div>

          {report.coverageDiagnostics.topicCoverage && (
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Assessed Technical Dimensions:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {report.coverageDiagnostics.topicCoverage.map((topic) => (
                  <span
                    key={topic}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-xs)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    #{topic.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Actions Card */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-main)', margin: '0 0 0.25rem 0' }}>
            Inspect Your Answers & Practice Targeted Retries
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Open the replay transcript to see exact quotes evaluated by the panel, and attempt retry variants on lower-scoring questions.
          </p>
        </div>

        <Link to={`/app/interviews/${sessionId}/replay`}>
          <Button variant="primary" rightIcon={<ExternalLink size={14} />}>
            Open Replay & Retries
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default CandidateReportPage;
