import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Layers,
  Copy,
  Eye,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ScoreBar } from '../reports/ScoreBar';
import {
  assessQuestion,
  saveQuestionDraft,
} from '../reports/services/assessmentApi';
import { QUESTION_LAB_PRESETS } from '../reports/services/assessmentFixtures';

/**
 * QuestionLabPage - Interviewer Question Sandbox & Quality Lab
 * Styled with warm cream surfaces, terracotta accents, and serif headings matching reference image.
 * Route: /expert/question-lab
 */
export function QuestionLabPage() {
  const [role, setRole] = useState('Backend Developer');
  const [level, setLevel] = useState('junior');
  const [topic, setTopic] = useState('concurrency');
  const [question, setQuestion] = useState(
    'How do you handle an aggressive mobile client that retries an order payment request 3 times within 2 seconds because of a transient Wi-Fi timeout?'
  );
  const [sampleAnswer, setSampleAnswer] = useState(
    'Require client to send an Idempotency-Key UUID header. Store the key in Redis or Postgres with a UNIQUE constraint and state PENDING. Reject simultaneous duplicates with 409 or return the cached final response.'
  );

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSavedDraft, setIsSavedDraft] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleApplyPreset = (preset) => {
    setRole(preset.role);
    setLevel(preset.level.toLowerCase().includes('junior') ? 'junior' : preset.level.toLowerCase().includes('senior') ? 'senior' : 'mid');
    setTopic(preset.topic);
    setQuestion(preset.question);
    setSampleAnswer(preset.sampleAnswer);
    setAssessmentResult(null);
    setIsSavedDraft(false);
    setShowComparison(false);
  };

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || question.trim().length < 15) {
      setErrorMsg('Please specify a question of at least 15 characters.');
      return;
    }
    setErrorMsg('');
    setIsEvaluating(true);
    setIsSavedDraft(false);

    try {
      const res = await assessQuestion({
        role,
        level,
        topic,
        question,
        sampleAnswer,
      });
      setAssessmentResult(res);
      setShowComparison(true);
    } catch (err) {
      console.error('Failed to evaluate question:', err);
      setErrorMsg(err.message || 'Question evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveQuestionDraft({
        role,
        level,
        topic,
        question,
        sampleAnswer,
        suggestedRewrite: assessmentResult?.suggestedRewrite,
        scores: assessmentResult?.scores,
      });
      setIsSavedDraft(true);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

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
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-muted, #8C857B)' }}>
        <Link to="/expert" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted, #8C857B)' }}>
          <ArrowLeft size={14} />
          <span>Expert Queue</span>
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 600 }}>Interviewer Question Lab</span>
      </div>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
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
              Interviewer Question Lab & Sandbox
            </h1>
            <Badge variant="accent">
              <FlaskConical size={12} style={{ marginRight: '4px' }} />
              Sandbox Mode
            </Badge>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #5E5953)', marginTop: '0.375rem', margin: 0 }}>
            Craft, simulate, and calibrate board interview prompts. Evaluates relevance, clarity, and rubrics before saving as drafts.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #8C857B)', fontWeight: 600 }}>Presets:</span>
          {QUESTION_LAB_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #E5DFD6)',
                color: 'var(--color-primary, #B85042)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Output Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: assessmentResult ? 'minmax(0, 1.1fr) minmax(0, 0.9fr)' : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: QUESTION PROMPT FORM */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderRadius: 'var(--radius-card, 14px)',
            border: '1px solid var(--color-border, #E5DFD6)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border-subtle, #EFECE6)', paddingBottom: '0.75rem' }}>
            <Layers size={18} color="var(--color-primary, #B85042)" />
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-main, #1A1816)',
                margin: 0,
              }}
            >
              Question Configuration
            </h2>
          </div>

          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target Role & Level */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #5E5953)', marginBottom: '0.375rem' }}>
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: 'var(--color-bg, #FAF7F2)',
                    border: '1px solid var(--color-border, #E5DFD6)',
                    borderRadius: '6px',
                    color: 'var(--color-text-main, #1A1816)',
                    fontSize: '13px',
                  }}
                >
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Backend Systems Architect">Backend Systems Architect</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #5E5953)', marginBottom: '0.375rem' }}>
                  Seniority Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: 'var(--color-bg, #FAF7F2)',
                    border: '1px solid var(--color-border, #E5DFD6)',
                    borderRadius: '6px',
                    color: 'var(--color-text-main, #1A1816)',
                    fontSize: '13px',
                  }}
                >
                  <option value="junior">Junior (0-2 YOE)</option>
                  <option value="mid">Mid-Level (3-5 YOE)</option>
                  <option value="senior">Senior (6+ YOE)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #5E5953)', marginBottom: '0.375rem' }}>
                  Primary Curriculum Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: 'var(--color-bg, #FAF7F2)',
                    border: '1px solid var(--color-border, #E5DFD6)',
                    borderRadius: '6px',
                    color: 'var(--color-text-main, #1A1816)',
                    fontSize: '13px',
                  }}
                >
                  <option value="concurrency">Concurrency & Locking</option>
                  <option value="apis">API Contracts & Protocols</option>
                  <option value="databases">Databases & Indexes</option>
                  <option value="project_tradeoffs">Project Tradeoffs & Triage</option>
                  <option value="reliability">Distributed Reliability</option>
                </select>
              </div>
            </div>

            {/* Proposed Question Prompt */}
            <div>
              <label htmlFor="lab-question" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main, #1A1816)', marginBottom: '0.375rem' }}>
                Proposed Boardroom Question Text <span style={{ color: 'var(--color-error, #B83838)' }}>*</span>
              </label>
              <textarea
                id="lab-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="State the technical scenario, constraints, and questions the candidate must address..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-bg, #FAF7F2)',
                  border: '1px solid var(--color-border, #E5DFD6)',
                  borderRadius: '8px',
                  color: 'var(--color-text-main, #1A1816)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Reference Outline / Expected Answer */}
            <div>
              <label htmlFor="lab-answer" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary, #5E5953)', marginBottom: '0.375rem' }}>
                Sample Solution Key & Rubric Expectations
              </label>
              <textarea
                id="lab-answer"
                value={sampleAnswer}
                onChange={(e) => setSampleAnswer(e.target.value)}
                rows={3}
                placeholder="Outline the core key criteria (e.g., must mention idempotency key, unique constraint, HTTP 409 status code)..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-bg, #FAF7F2)',
                  border: '1px solid var(--color-border, #E5DFD6)',
                  borderRadius: '8px',
                  color: 'var(--color-text-secondary, #5E5953)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {errorMsg && (
              <span style={{ fontSize: '12px', color: 'var(--color-error, #B83838)' }}>
                {errorMsg}
              </span>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)' }}>
                Evaluation checks role relevance, clarity, assessability, and suggested rewrites.
              </span>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isEvaluating}
                leftIcon={<Sparkles size={16} />}
              >
                Evaluate Question Quality
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: ASSESSMENT METRICS & SUGGESTED REWRITE */}
        {assessmentResult && (
          <div
            style={{
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              borderRadius: 'var(--radius-card, 14px)',
              border: '1px solid var(--color-border, #E5DFD6)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-card)',
              animation: 'dev3FadeIn 0.3s ease forwards',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle, #EFECE6)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--color-success, #2D7252)" />
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-text-main, #1A1816)',
                    margin: 0,
                  }}
                >
                  Quality Assessment Results
                </h3>
              </div>

              <Badge variant="reviewed">
                Quality Index: {assessmentResult.scores.composite.toFixed(1)} / 4.0
              </Badge>
            </div>

            {/* Metrics Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <ScoreBar
                label="Role Relevance"
                score={assessmentResult.scores.roleRelevance}
                max={4.0}
                size="sm"
                colorVariant="accent"
              />
              <ScoreBar
                label="Level Fit & Discrimination"
                score={assessmentResult.scores.levelFit}
                max={4.0}
                size="sm"
                colorVariant="primary"
              />
              <ScoreBar
                label="Prompt Clarity"
                score={assessmentResult.scores.clarity}
                max={4.0}
                size="sm"
                colorVariant="success"
              />
              <ScoreBar
                label="Assessability & Rubric"
                score={assessmentResult.scores.assessability}
                max={4.0}
                size="sm"
                colorVariant="warning"
              />
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--color-success, #2D7252)' }}>Identified Strengths:</span>
                <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
                  {assessmentResult.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: 'var(--color-warning, #9E671E)' }}>Opportunities to Sharpen:</span>
                <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', color: 'var(--color-text-secondary, #5E5953)', lineHeight: 1.5 }}>
                  {assessmentResult.vulnerabilities.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggested Enhanced Rewrite */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#FAF5F0',
                borderRadius: '8px',
                border: '1px solid rgba(184, 80, 66, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary, #B85042)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Suggested Enhanced Formulation
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestion(assessmentResult.suggestedRewrite)}
                  leftIcon={<Copy size={12} />}
                >
                  Use Rewrite
                </Button>
              </div>

              <p style={{ fontSize: '14px', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--color-text-main, #1A1816)', margin: 0, lineHeight: 1.5 }}>
                "{assessmentResult.suggestedRewrite}"
              </p>
            </div>

            {/* Side-by-Side Comparison */}
            {showComparison && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg, #FAF7F2)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #E5DFD6)',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary, #5E5953)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-text-main, #1A1816)', marginBottom: '0.25rem' }}>
                  Original Prompt vs Rewrite Comparison:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--color-border, #E5DFD6)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8C857B)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Original:</span>
                    <span style={{ color: 'var(--color-text-secondary, #5E5953)' }}>{question}</span>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid rgba(184, 80, 66, 0.3)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary, #B85042)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Enhanced Rewrite:</span>
                    <span style={{ color: 'var(--color-text-main, #1A1816)', fontWeight: 500 }}>{assessmentResult.suggestedRewrite}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions: Save Draft */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                borderTop: '1px solid var(--color-border-subtle, #EFECE6)',
                paddingTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  leftIcon={<Eye size={14} />}
                >
                  {showComparison ? 'Hide Diff' : 'Compare Original vs Rewrite'}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSavedDraft}
                  leftIcon={<Bookmark size={14} />}
                >
                  {isSavedDraft ? 'Draft Saved to Bank' : 'Save Draft to Question Bank'}
                </Button>
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: isSavedDraft ? 'var(--color-success, #2D7252)' : 'var(--color-text-muted, #8C857B)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <FileCheck size={13} />
                <span>
                  {isSavedDraft
                    ? 'Draft successfully saved to Question Bank staging queue. Requires Admin sign-off before production release.'
                    : 'Saving only creates an unpublished draft. Questions are never published directly to active candidates.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionLabPage;
