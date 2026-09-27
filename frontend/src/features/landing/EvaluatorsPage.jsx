import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Scale,
  Brain,
  Lock,
  Target,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth-context';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';

export function EvaluatorsPage() {
  const navigate = useNavigate();
  const { devMode, setDevAccount } = useAuth();

  const handleEvaluatorSignIn = () => {
    if (devMode) {
      setDevAccount('evaluator');
      navigate('/expert');
    } else {
      navigate('/auth?tab=signin');
    }
  };

  const handleScrollToWorkflow = () => {
    const el = document.getElementById('evaluator-workflow');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text-main)' }}>
      <PublicNavbar ctaText="Evaluator sign in" ctaAction={handleEvaluatorSignIn} />

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 1.25rem 4.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--color-primary)',
            marginBottom: '1rem',
          }}
        >
          FOR EVALUATORS
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            lineHeight: 1.15,
            maxWidth: '860px',
            margin: '0 auto 1.5rem',
          }}
        >
          Review reasoning. <br />
          <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>Not just answers.</em>
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          PanelIQ gives evaluators structured, evidence-linked feedback tools for reviewing candidate responses.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            size="lg"
            variant="primary"
            onClick={handleEvaluatorSignIn}
            rightIcon={<ArrowRight size={18} />}
          >
            Evaluator sign in
          </Button>
          <Button size="lg" variant="outline" onClick={handleScrollToWorkflow}>
            See how it works
          </Button>
        </div>
      </section>

      {/* Section A: Evaluator Workflow */}
      <section
        id="evaluator-workflow"
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4.5rem 1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            REVIEW TIMELINE
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Evaluator review workflow.
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.6,
              marginBottom: '3rem',
            }}
          >
            A 5-step structured process that keeps expert evaluators in complete control of final hiring recommendations.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Step 01 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '1.75rem 1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                01
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.375rem' }}>
                Open assigned session
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Access candidate sessions routed to your private reviewer queue via verified assignment.
              </p>
            </div>

            {/* Step 02 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '1.75rem 1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                02
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.375rem' }}>
                Review candidate responses
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Inspect the chronological 8-turn interview transcript including pivot questions and constraints.
              </p>
            </div>

            {/* Step 03 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '1.75rem 1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                03
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.375rem' }}>
                Inspect evidence
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Validate the character-level excerpts cited by the system for each of the four core criteria.
              </p>
            </div>

            {/* Step 04 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '1.75rem 1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                04
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.375rem' }}>
                Correct evaluation
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Apply expert rating overrides with mandatory audit justification notes whenever nuance is required.
              </p>
            </div>

            {/* Step 05 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '1.75rem 1.25rem',
                border: '1px solid var(--color-primary)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                05
              </div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.375rem' }}>
                Release report
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Publish an immutable report revision with official scoring and feedback visible to the candidate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: Evidence-First Review (Polished Mock Card) */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 1.25rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-primary)',
              marginBottom: '0.75rem',
            }}
          >
            GROUND TRUTH REVIEW
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Every rating pinned to exact candidate text.
          </h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            No vague impressions or ungrounded scores. Evaluators inspect exact character slices with verified answer offsets, missing concepts, and trade-off limitations.
          </p>
        </div>

        {/* Polished Mock Evaluation Card */}
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                TURN 03 • TECHNICAL DEPTH
              </span>
              <Badge variant="reviewed">Candidate Answer Verified</Badge>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Offset: [35:52]
            </div>
          </div>

          <div style={{ padding: '1.75rem' }}>
            {/* Candidate Answer Slice */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                CANDIDATE RESPONSE EXCERPT
              </div>
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 1.6,
                  color: 'var(--color-text-main)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                "We use a database transaction with{' '}
                <mark
                  style={{
                    backgroundColor: 'rgba(184, 80, 66, 0.16)',
                    color: 'var(--color-primary)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  SELECT FOR UPDATE
                </mark>{' '}
                to lock the row and check stock &gt; 0 before updating the order count."
              </div>
            </div>

            {/* Criteria Evaluation Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Criterion & Rating */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    CRITERION
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    RATING: 3 / 4 (Solid)
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Correctness (Weight: 40%)
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Candidate correctly identified pessimistic row-level locking to prevent race conditions during concurrent stock decrements.
                </p>
              </div>

              {/* Missing Points & Limitations */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: '0.5rem' }}>
                  IDENTIFIED GAPS & LIMITATIONS
                </div>
                <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, paddingLeft: '1.1rem', margin: 0 }}>
                  <li>Did not address lock wait timeouts or deadlocks under high throughput.</li>
                  <li>Scoped to single-database ACID; does not consider distributed transactions.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Structured Scoring (4 Dimensions) */}
      <section
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4.5rem 1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            OBJECTIVE RUBRICS
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Four structured evaluation dimensions.
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.6,
              marginBottom: '3rem',
            }}
          >
            Fixed PRD criteria weights ensure that every candidate response is evaluated against consistent, objective standards.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Dimension 1: Correctness */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)' }}>40% WEIGHT</span>
                <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Correctness
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Technical accuracy, data race prevention, transactional integrity, and adherence to system requirements.
              </p>
            </div>

            {/* Dimension 2: Reasoning */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)' }}>25% WEIGHT</span>
                <Brain size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Reasoning
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Architectural problem framing, coherent explanation of system mechanics, and sound technical defense.
              </p>
            </div>

            {/* Dimension 3: Relevance */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)' }}>20% WEIGHT</span>
                <Target size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Relevance
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Direct focus on answering the core question without evasive filler text or tangential system discussions.
              </p>
            </div>

            {/* Dimension 4: Trade-offs */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)' }}>15% WEIGHT</span>
                <Scale size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Trade-offs / Application
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Awareness of practical compromises, latency vs. consistency costs, operational complexity, and failure modes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section D: Review & Correction (Human-in-the-Loop) */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 1.25rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-primary)',
              marginBottom: '0.75rem',
            }}
          >
            HUMAN-IN-THE-LOOP
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            AI can propose an evaluation. <br />
            <em>Human evaluators remain in control.</em>
          </h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Automated analysis extracts relevant quotes and provides preliminary checks. Final ratings, qualitative feedback, and report releases belong exclusively to human reviewers.
          </p>
        </div>

        {/* Stepper Flow Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '1.25rem',
          }}
        >
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>01 PROPOSAL</div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>AI Extracts Evidence</h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Candidate answer text is analyzed for key concepts, preliminary ratings, and candidate excerpts.
            </p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>02 AUDIT</div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>Evaluator Verification</h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Expert reviews transcript, checks cited sentences, and inspects missed technical nuances.
            </p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>03 OVERRIDE</div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>Correction & Notes</h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Evaluator updates any rating (0–4) with documented reasoning saved to immutable audit history.
            </p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(184, 80, 66, 0.05)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-primary)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>04 RELEASE</div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>Official Release</h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Final report revision is locked, scored, and published directly to the candidate dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Section E: Assignment-Based Access */}
      <section
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4.5rem 1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                ACCESS CONTROL
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                Assignment-based review security.
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Reviewers only see sessions explicitly assigned to them by administrators. Candidates cannot view internal evaluator notes, draft rubrics, or peer sessions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} /> Strict session assignment isolation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={18} style={{ color: 'var(--color-primary)' }} /> Candidates cannot release or alter reports
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} style={{ color: 'var(--color-primary)' }} /> Timestamped audit history for every score change
                </div>
              </div>
            </div>

            {/* Visual Security Box */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-panel)',
                padding: '2rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  REVIEWER QUEUE
                </span>
                <Badge variant="reviewed">Authenticated</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ fontWeight: 600 }}>Session #8921 • Backend (Intermediate)</span>
                    <span style={{ color: 'var(--color-primary)' }}>Assigned to You</span>
                  </div>
                </div>
                <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ fontWeight: 600 }}>Session #8924 • Concurrency & APIs</span>
                    <span style={{ color: 'var(--color-primary)' }}>Assigned to You</span>
                  </div>
                </div>
                <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-control)', opacity: 0.6, fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Session #8930 • Unassigned Session</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Access Restricted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section F: Report Release */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 1.25rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-primary)',
              marginBottom: '0.75rem',
            }}
          >
            OFFICIAL CERTIFICATION
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Review, sign off, and release.
          </h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Once you release an official report revision, the score and feedback become an immutable record for candidate coaching and hiring decisions.
          </p>
        </div>

        {/* Released Report Mock Card */}
        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            padding: '2rem 1.75rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Candidate Evaluation Report</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Role: Backend Developer (Junior) • 8 Turns Scored</div>
            </div>
            <Badge variant="reviewed">Released • Revision 1</Badge>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-control)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                FINAL NORMALIZED SCORE
              </div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                87.5 <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ 100</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <div>Weight: 40% Correctness • 25% Reasoning</div>
              <div>20% Relevance • 15% Trade-offs</div>
            </div>
          </div>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            "Candidate demonstrated strong architectural depth with appropriate row-locking semantics for inventory handling. Recommended focus areas: distributed timeout handling and edge cases under network partition."
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
            <span>Verified by Assigned Evaluator</span>
            <span>Immutable Report Revision</span>
          </div>
        </div>
      </section>

      {/* Section G: Final CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--color-border)',
            padding: '4rem 1.5rem',
            boxShadow: 'var(--shadow-card)',
            maxWidth: '840px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={16} /> EVIDENCE-BASED REVIEW
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Ready to review better interviews?
          </h2>

          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '540px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.6,
            }}
          >
            Sign in to access your assigned reviewer queue and evaluate candidate technical reasoning with full quote verification.
          </p>

          <Button
            size="lg"
            variant="primary"
            onClick={handleEvaluatorSignIn}
            rightIcon={<ArrowRight size={18} />}
          >
            Evaluator sign in →
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default EvaluatorsPage;
