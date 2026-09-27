import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  FileCheck2,
  BarChart3,
  Sliders,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth-context';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, setDevAccount, devMode } = useAuth();

  const handleStartPractice = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  const handleRoleSignIn = (roleKey) => {
    if (devMode) {
      setDevAccount(roleKey);
      navigate(roleKey === 'admin' ? '/admin/questions' : '/app');
    } else {
      navigate('/auth?tab=signin');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text-main)', overflowX: 'hidden' }}>
      {/* Top Header */}
      <header
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--color-text-main)',
            textDecoration: 'none',
          }}
        >
          PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
        </Link>

        <nav
          style={{ display: 'none', gap: '2rem', alignItems: 'center' }}
          className="landing-nav"
          aria-label="Main navigation"
        >
          <a href="#how-it-works" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            How it works
          </a>
          <a href="#for-candidates" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            For candidates
          </a>
          <a href="#for-evaluators" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            For evaluators
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <Link to="/app">
              <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={handleStartPractice} rightIcon={<ArrowRight size={16} />}>
              Start practice
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3rem 1rem 4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Headlines */}
        <div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-primary)',
              marginBottom: '1rem',
            }}
          >
            INTERVIEW PRACTICE, WITH EVIDENCE
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
              lineHeight: 1.15,
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              marginBottom: '1.25rem',
            }}
          >
            The interview <br />
            is a skill. <br />
            <em>Practice it.</em>
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '460px',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Practice technical questions. Review the evidence. Try again with purpose.
          </p>

          <Button
            size="lg"
            variant="primary"
            onClick={handleStartPractice}
            rightIcon={<ArrowRight size={18} />}
          >
            Start practice
          </Button>
        </div>

        {/* Right Column: Boardroom Simulation Preview Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-elevated)',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Card Topbar */}
          <div
            style={{
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface-subtle)',
              fontSize: 'var(--font-size-xs)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ fontWeight: 800, letterSpacing: '0.06em' }}>
              PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
              <span>Technical • 03/08</span>
              <div
                style={{
                  width: '50px',
                  height: '4px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-border)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '38%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
              </div>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>Exit practice</span>
          </div>

          {/* Panelist Tags */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              &lt;&gt; Technical Specialist
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface-subtle)',
                whiteSpace: 'nowrap',
              }}
            >
              Panel Chair
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface-subtle)',
                whiteSpace: 'nowrap',
              }}
            >
              Project Evaluator
            </div>
          </div>

          {/* Question Box */}
          <div style={{ padding: '1.25rem' }}>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span>&lt;&gt;</span> Technical Specialist
            </div>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginBottom: '0.75rem',
                lineHeight: 1.35,
              }}
            >
              Design a duplicate-safe order processing system.
            </h3>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              How would you ensure that an e-commerce order is processed exactly once, even if the same request is received multiple times due to retries or network issues? Walk me through your approach, including key components, trade-offs, and how you would test it.
            </p>

            {/* Answer Composer Area */}
            <div
              style={{
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                padding: '0.875rem',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  minHeight: '70px',
                }}
              >
                Type your response here...
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.625rem',
                  borderTop: '1px solid var(--color-border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Markdown ▾
                </div>
                <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} />}>
                  Send response
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll indicator */}
      <div style={{ textAlign: 'center', paddingBottom: '2.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
        Scroll to explore ↓
      </div>

      {/* Section 1: Practice Loop */}
      <section
        id="how-it-works"
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4rem 1rem',
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
            HOW IT WORKS
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '2.5rem',
            }}
          >
            A simple practice loop.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '2rem',
            }}
          >
            {/* Step 1 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(184, 80, 66, 0.1)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: '1rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Practice
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Answer realistic, role-based questions in a simulated panel boardroom setting.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(184, 80, 66, 0.1)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: '1rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Review evidence
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                See structured, evidence-linked feedback from multiple perspectives without fabricated scores.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(184, 80, 66, 0.1)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: '1rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Try again
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Apply what you learn to a comparable variant and build reasoning confidence over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Five Core Features */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem' }}>
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
          FIVE WAYS PANELIQ HELPS
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            marginBottom: '2.5rem',
          }}
        >
          Better questions lead to better conversations.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* F1 */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Adaptive boardroom
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Practice with a panel of distinct roles that reflect real interview dynamics: Chair, Technical Specialist, and Project Evaluator.
            </p>
          </div>

          {/* F2 */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck2 size={20} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Question quality
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Role-specific, realistic technical questions with structured follow-ups, domain alignment, and clarity diagnostics.
            </p>
          </div>

          {/* F3 */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={20} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Evidence scorecard
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Structured feedback across key criteria with excerpt-linked evidence. Pending status is never represented as zero.
            </p>
          </div>

          {/* F4 */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={20} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Constraint challenge
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Practice under realistic conditions: one constraint changes dynamically, challenging how you defend architectural choices.
            </p>
          </div>

          {/* F5 */}
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(184, 80, 66, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={20} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Replay & retry
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Revisit an answer timeline, understand gaps, and try a comparable problem without altering the original immutable attempt.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Illustrative Sample Report */}
      <section
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '2.5rem',
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
              ILLUSTRATIVE SAMPLE REPORT
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              See the evidence behind the feedback.
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              Feedback is structured by criteria, with clear evidence and notes from each evaluator. You can see what went well, where to improve, and what to try next.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
              Sample report preview below
            </div>
          </div>

          {/* Sample report card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem 1.25rem',
              boxShadow: 'var(--shadow-card)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                Design a duplicate-safe order processing system.
              </div>
              <Badge variant="default" style={{ fontSize: '11px' }}>
                Illustrative sample
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Row 1 */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>System design</div>
                  <Badge variant="reviewed">Reviewed</Badge>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Proposed an idempotency key with a durable store and discussed trade-offs with TTL, consistency, and failure modes.
                </p>
              </div>

              {/* Row 2 */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Error handling</div>
                  <Badge variant="reviewed">Reviewed</Badge>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Covered retries, backoff strategy, and how to avoid duplicate side effects in downstream services.
                </p>
              </div>

              {/* Row 3 */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Testing approach</div>
                  <Badge variant="pending">Pending</Badge>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Consider boundary cases and how you would test for duplicates under concurrency and network retries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Built for Real Roles */}
      <section id="for-candidates" style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem' }}>
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
          BUILT FOR REAL ROLES
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          Different perspectives. A better practice experience.
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}
        >
          PanelIQ helps candidates practice with realistic, role-based questions and gives evaluators structured, evidence-linked feedback.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Candidate Card */}
          <div
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(184, 80, 66, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Users size={20} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Candidate
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Practice technical interviews, review evidence-based feedback, and track your progress across multiple sessions.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleRoleSignIn('candidate')}
              rightIcon={<ArrowRight size={16} />}
            >
              Start practice
            </Button>
          </div>

          {/* Assigned Evaluator Card */}
          <div
            id="for-evaluators"
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  color: 'var(--color-text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FileCheck2 size={20} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Assigned evaluator
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Sign in to evaluate assigned candidate responses. Access is limited to your assigned sessions only.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleRoleSignIn('evaluator')}
              rightIcon={<ArrowRight size={16} />}
            >
              Evaluator sign in
            </Button>
          </div>

          {/* Admin Card */}
          <div
            style={{
              padding: '2rem 1.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  color: 'var(--color-text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Shield size={20} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Admin
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Manage users, configure panels, and view practice activity. Access is limited to approved admins, with question bank management after your role is approved.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleRoleSignIn('admin')}
              rightIcon={<ArrowRight size={16} />}
            >
              Admin sign in
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '2.5rem 1rem',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            PANEL<span style={{ color: 'var(--color-primary)' }}>IQ</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
            <a href="#how-it-works">How it works</a>
            <a href="#for-candidates">For candidates</a>
            <a href="#for-evaluators">For evaluators</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1280px',
            margin: '1.25rem auto 0',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          PanelIQ is a prototype for simulation, coaching, and human decision support. It does not establish that AI can objectively determine job suitability. No automatic hiring/rejection decision is in scope.
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .landing-nav {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
