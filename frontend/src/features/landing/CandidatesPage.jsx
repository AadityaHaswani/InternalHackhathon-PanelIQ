import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Compass,
  Briefcase,
  FileCheck,
  Target,
  AlertTriangle,
  Sliders,
  RotateCcw,
  TrendingUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth-context';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';

export function CandidatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartPractice = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  const handleScrollToFlow = () => {
    const el = document.getElementById('candidate-flow');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text-main)' }}>
      <PublicNavbar ctaText="Start practice" ctaAction={handleStartPractice} />

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
          FOR CANDIDATES
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
          Practice like the interview <br />
          <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>actually matters.</em>
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
          Build confidence through realistic technical interviews, structured feedback, and repeat practice.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            size="lg"
            variant="primary"
            onClick={handleStartPractice}
            rightIcon={<ArrowRight size={18} />}
          >
            Start practice
          </Button>
          <Button size="lg" variant="outline" onClick={handleScrollToFlow}>
            See how it works
          </Button>
        </div>
      </section>

      {/* Section A: How Candidate Practice Works */}
      <section
        id="candidate-flow"
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
            PRACTICE WORKFLOW
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            How candidate practice works.
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
            Four structured steps designed to simulate the pacing and depth of real senior engineering panels.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Step 01 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem 1.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem',
                }}
              >
                01
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Choose your practice
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Select your engineering domain and target level—Junior or Intermediate—with tailored question coverage across APIs, databases, and concurrency.
              </p>
            </div>

            {/* Step 02 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem 1.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem',
                }}
              >
                02
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Face the panel
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Experience an 8-turn interview simulation with distinct panelist roles asking core technical questions, probing follow-ups, and live constraint pivots.
              </p>
            </div>

            {/* Step 03 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem 1.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem',
                }}
              >
                03
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Review your evidence
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Review transparent scorecards where every evaluated criterion links directly to verbatim sentences from your answer, highlighting strengths and missing points.
              </p>
            </div>

            {/* Step 04 */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem 1.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '0.1em',
                  marginBottom: '1rem',
                }}
              >
                04
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Try again
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Spawn a comparable retry attempt on a matched question variant with identical rubric standards to test whether you've truly internalized the feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: The Panel Experience */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 1.25rem' }}>
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
          THE BOARDROOM PANEL
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          Three perspectives. One realistic panel.
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
          Real engineering interviews are never a single monologue. PanelIQ simulates a cross-functional panel that evaluates depth, structure, and pragmatism.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '1.75rem',
          }}
        >
          {/* Specialist */}
          <div
            style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Code2 size={22} />
            </div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              TECHNICAL DEPTH
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Technical Specialist
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Tests architectural correctness, concurrency, data storage choices, and failure mechanics. Expect in-depth follow-ups when race conditions or bottlenecks are unaddressed.
            </p>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              Focus: APIs, relational/NoSQL DBs, row locking, idempotency, caching.
            </div>
          </div>

          {/* Chair */}
          <div
            style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Compass size={22} />
            </div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              STRUCTURE & CONTEXT
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Panel Chair
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Keeps the interview organized and tests how clearly you frame technical problems. Evaluates communication clarity, structured reasoning, and problem deconstruction.
            </p>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              Focus: Problem scoping, clarity of explanation, decision structure.
            </div>
          </div>

          {/* Evaluator */}
          <div
            style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Briefcase size={22} />
            </div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              PRAGMATIC TRADE-OFFS
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Project Evaluator
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Looks at the operational realities of your choices. Evaluates maintenance overhead, latency vs. consistency compromises, and practical engineering trade-offs.
            </p>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              Focus: Real-world operational costs, system limitations, practical compromises.
            </div>
          </div>
        </div>
      </section>

      {/* Section C: What You Get After Practice */}
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
            POST-INTERVIEW INSIGHTS
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            What you get after practice.
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
            Every report is grounded in genuine evidence from your answers, designed to guide targeted improvement rather than hand out generic scores.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Card 1 */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.875rem' }}><FileCheck size={22} /></div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>Evidence-linked feedback</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Every criterion rating links to exact excerpts from your answer so you know exactly which sentence earned praise or fell short.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.875rem' }}><Target size={22} /></div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>Criterion-based scoring</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Standardized 0–4 evaluations across Correctness (40%), Reasoning (25%), Relevance (20%), and Trade-offs (15%).
              </p>
            </div>

            {/* Card 3 */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.875rem' }}><AlertTriangle size={22} /></div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>Missing reasoning points</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Clear explanations of omitted edge cases, concurrency hazards, or architectural alternatives that were expected for the level.
              </p>
            </div>

            {/* Card 4 */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.875rem' }}><Sliders size={22} /></div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>Constraint challenges</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Feedback detailing how effectively you adapted your design when unexpected operational constraints were injected mid-session.
              </p>
            </div>

            {/* Card 5 */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.875rem' }}><RotateCcw size={22} /></div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>Comparable retries</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Retackle missed concepts using pre-approved question variants that share the same rubric complexity to objectively test improvement.
              </p>
            </div>

            {/* Card 6 */}
            <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.875rem' }}><TrendingUp size={22} /></div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.375rem' }}>Progress across sessions</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Track performance trajectories across completed interviews, with full access to past interview transcripts and released reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section D: Constraint Challenge Spotlight */}
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
            DYNAMIC ADAPTATION
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Your design worked. <br />
            <em>Now the constraint changes.</em>
          </h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Real technical interviewers rarely let you stop at your initial design. Once your baseline works, the panel injects a realistic operational shift to evaluate your engineering depth.
          </p>
        </div>

        {/* Visual Before / After Card */}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              divideX: '1px solid var(--color-border)',
            }}
          >
            {/* Left: Baseline Question */}
            <div style={{ padding: '2rem 1.75rem', borderRight: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 1 • BASELINE
                </span>
                <Badge variant="reviewed">Approved Design</Badge>
              </div>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>
                Design an order processing system.
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                "We use a transactional outbox with PostgreSQL to record order state, and a worker process pulls from the outbox to notify downstream payment gateways."
              </p>
              <div style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-control)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                ✓ Result: Panel approves basic durability and idempotency strategy.
              </div>
            </div>

            {/* Right: Injected Constraint */}
            <div style={{ padding: '2rem 1.75rem', backgroundColor: 'rgba(184, 80, 66, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 2 • THE PIVOT
                </span>
                <Badge variant="pending">Constraint Changed</Badge>
              </div>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>
                Traffic has increased 10×.
              </h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                "Flash sale volume causes extreme lock contention on the single database. Write IOPS hit maximum capacity and checkout latency spikes to 12 seconds."
              </p>
              <div style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-control)', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                Challenge: How do you decouple inventory deduction without overselling?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section E: Try Again (Replay & Retry Flow) */}
      <section
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4.5rem 1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            DELIBERATE PRACTICE
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Revisit. Understand. Retackle.
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              margin: '0 auto 3rem',
              lineHeight: 1.6,
            }}
          >
            The goal is genuine learning, not simply gaming a score. PanelIQ structures retries to help you master reasoning gaps.
          </p>

          {/* Stepper Flow Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <div style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Step 1</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Previous Answer</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Original response remains preserved and immutable in your interview timeline.</div>
            </div>

            <ArrowDown size={18} style={{ color: 'var(--color-primary)' }} />

            <div style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Step 2</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Evidence & Excerpts</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Review character-level excerpts linking what you said to specific rubric criteria.</div>
            </div>

            <ArrowDown size={18} style={{ color: 'var(--color-primary)' }} />

            <div style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Step 3</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>What Was Missing</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Pinpoint unaddressed trade-offs, omitted locking mechanisms, or unhandled failures.</div>
            </div>

            <ArrowDown size={18} style={{ color: 'var(--color-primary)' }} />

            <div style={{ width: '100%', padding: '1.25rem', backgroundColor: 'rgba(184, 80, 66, 0.06)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-primary)', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Step 4</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Comparable Retry</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Answer an approved variant question to apply your corrected mental model.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section F: Final CTA */}
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
            <Sparkles size={16} /> PRACTICE WITH PURPOSE
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
            Ready to practice?
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
            Start an 8-turn technical interview simulation and see the exact evidence behind your feedback.
          </p>

          <Button
            size="lg"
            variant="primary"
            onClick={handleStartPractice}
            rightIcon={<ArrowRight size={18} />}
          >
            Start practice →
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default CandidatesPage;
