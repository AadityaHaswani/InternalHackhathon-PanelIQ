import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  FileCheck2,
  Sliders,
  RotateCcw,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth-context';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, devMode, setDevAccount } = useAuth();

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
      navigate(roleKey === 'admin' ? '/admin/questions' : (roleKey === 'evaluator' ? '/expert' : '/app'));
    } else {
      navigate('/auth?tab=signin');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text-main)' }}>
      <PublicNavbar />

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3.5rem 1.25rem 4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Headlines & CTA */}
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
              fontSize: 'clamp(2.5rem, 6vw, 3.85rem)',
              lineHeight: 1.12,
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              marginBottom: '1.25rem',
            }}
          >
            The interview <br />
            is a skill. <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>Practice it.</em>
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '480px',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Practice technical questions. Review the evidence. Try again with purpose.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartPractice}
              rightIcon={<ArrowRight size={18} />}
            >
              Start practice
            </Button>
            <Link to="/evaluators">
              <Button size="lg" variant="outline">
                For evaluators
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Compact Interview UI Preview */}
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
              padding: '0.75rem 1.25rem',
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
              <span>Technical • Turn 03/08</span>
              <div
                style={{
                  width: '48px',
                  height: '4px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-border)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '38%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
              </div>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>Live Session</span>
          </div>

          {/* Panelist Perspective Chips */}
          <div
            style={{
              padding: '0.625rem 1.25rem',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.2rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
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
                padding: '0.2rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
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
                padding: '0.2rem 0.625rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface-subtle)',
                whiteSpace: 'nowrap',
              }}
            >
              Project Evaluator
            </div>
          </div>

          {/* Question Box & Answer Simulation */}
          <div style={{ padding: '1.25rem' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginBottom: '0.5rem',
                lineHeight: 1.35,
              }}
            >
              Design a duplicate-safe order processing system.
            </h3>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                marginBottom: '1rem',
              }}
            >
              How do you ensure an e-commerce order is processed exactly once under network retries? Walk through your approach, idempotency key strategy, and trade-offs.
            </p>

            <div
              style={{
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                padding: '0.75rem',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.5,
                  minHeight: '44px',
                }}
              >
                We use an idempotency key stored in Redis with atomic check-and-set and a 24h TTL...
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--color-border-subtle)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Evidence-linked evaluation</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Ready to send →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: How It Works (Compact Practice Loop) */}
      <section
        id="how-it-works"
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '4rem 1.25rem',
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
              marginBottom: '1rem',
            }}
          >
            A simple practice loop.
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '620px',
              lineHeight: 1.6,
              marginBottom: '3rem',
            }}
          >
            Deliberate interview preparation built around realistic technical dialogue, evidence extraction, and measurable iteration.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '2rem',
            }}
          >
            {/* Step 1 */}
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
                  marginBottom: '1.25rem',
                }}
              >
                01
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Practice
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Answer realistic technical questions across an 8-turn simulation guided by an adaptive multi-perspective panel.
              </p>
            </div>

            {/* Step 2 */}
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
                  marginBottom: '1.25rem',
                }}
              >
                02
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Review evidence
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Inspect structured scorecards where every rating is tied directly to verbatim excerpts from your response, with zero fabricated scores.
              </p>
            </div>

            {/* Step 3 */}
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
                  marginBottom: '1.25rem',
                }}
              >
                03
              </div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Try again
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Retackle a matched, comparable question variant using identical rubric standards to measure genuine skill growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Why PanelIQ (High-Level Core Features) */}
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
          WHY PANELIQ
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          Better questions lead to better conversations.
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
          Designed specifically around architectural rigor, transparent evidence verification, and deliberate practice loops.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Card 1 */}
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
              Experience real interview dynamics with three distinct roles: Technical Specialist, Panel Chair, and Project Evaluator.
            </p>
          </div>

          {/* Card 2 */}
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
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Evidence scorecards
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Ratings grounded in verbatim character quotes across Correctness, Reasoning, Relevance, and Trade-offs.
            </p>
          </div>

          {/* Card 3 */}
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
              Constraint challenges
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Practice adapting on the fly when traffic, latency, or consistency requirements suddenly change.
            </p>
          </div>

          {/* Card 4 */}
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
              Deliberate retries
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Target missed concepts with paired question variants while keeping your original session timeline immutable.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Built for Real Roles (Compact 3-Role Cards) */}
      <section
        style={{
          borderTop: '1px solid var(--color-border)',
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
            BUILT FOR REAL ROLES
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Designed for both sides of the table.
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
            Whether practicing technical depth or reviewing candidate reasoning, PanelIQ provides structured, evidence-backed tools.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Candidate Card */}
            <div
              style={{
                padding: '2rem 1.75rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  CANDIDATES
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Practice realistic interviews.
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Build technical depth across core engineering topics, face sudden architectural constraint pivots, and view quote-verified feedback.
                </p>
              </div>
              <Link to="/candidates">
                <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} rightIcon={<ArrowRight size={16} />}>
                  Explore candidate practice
                </Button>
              </Link>
            </div>

            {/* Evaluator Card */}
            <div
              style={{
                padding: '2rem 1.75rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  EVALUATORS
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Review evidence and guide improvement.
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Inspect candidate answers against verified excerpts, apply expert score overrides, and release official evaluation reports.
                </p>
              </div>
              <Link to="/evaluators">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }} rightIcon={<ArrowRight size={16} />}>
                  Explore evaluator tools
                </Button>
              </Link>
            </div>

            {/* Admin Card */}
            <div
              style={{
                padding: '2rem 1.75rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  ADMIN
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Manage the platform and question bank.
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Manage reviewed question versions, review assignments, and platform settings. Access is limited to approved administrators.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleRoleSignIn('admin')}
                style={{ width: '100%', justifyContent: 'center' }}
                rightIcon={<ArrowRight size={16} />}
              >
                Admin sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Compact Final CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 1.25rem 5rem', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--color-border)',
            padding: '3.5rem 1.5rem',
            boxShadow: 'var(--shadow-card)',
            maxWidth: '840px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Ready to build interview confidence?
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '520px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            Step into the boardroom simulation and practice with authentic technical questions and evidence-backed feedback.
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
      </section>

      <PublicFooter />
    </div>
  );
}

export default LandingPage;
