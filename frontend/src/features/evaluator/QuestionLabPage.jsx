import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';

export function QuestionLabPage() {
  const toast = useToast();

  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState('technical');
  const [level, setLevel] = useState('junior');
  const [topic, setTopic] = useState('databases');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [error, setError] = useState(null);

  const handleEvaluateQuestion = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a draft question prompt.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAssessmentResult(null);

    try {
      // Backend contract: POST /api/v1/question-assessments
      const response = await apiClient.post('question-assessments', {
        prompt: prompt.trim(),
        stage,
        level,
        topics: [topic],
      });

      setAssessmentResult(response.data?.assessment || response.data);
      toast.success('Question evaluated by quality assessment engine.');
    } catch (err) {
      setError(err.message || 'Failed to assess draft question.');
      toast.error(err.message || 'Assessment request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link to="/expert" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Evaluator Queue
        </Link>
      </div>

      <PageHeader
        title="Interviewer Question Lab & Sandbox"
        description="Draft custom technical prompts and test algorithmic readiness indicators before submitting for human committee approval."
      />

      {/* Input Form Card */}
      <form
        onSubmit={handleEvaluateQuestion}
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Select
            label="Stage"
            options={[
              { value: 'icebreaker', label: 'Icebreaker' },
              { value: 'technical', label: 'Technical' },
              { value: 'techno_managerial', label: 'Techno-Managerial' },
              { value: 'reflection', label: 'Reflection' },
            ]}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />

          <Select
            label="Candidate Level"
            options={[
              { value: 'junior', label: 'Junior' },
              { value: 'intermediate', label: 'Intermediate' },
            ]}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />

          <Select
            label="Primary Topic"
            options={[
              { value: 'databases', label: 'Databases' },
              { value: 'apis', label: 'APIs' },
              { value: 'concurrency', label: 'Concurrency' },
              { value: 'reliability', label: 'Reliability' },
              { value: 'project_tradeoffs', label: 'Project Trade-offs' },
            ]}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '0.375rem' }}>
            Draft Question Prompt
          </label>
          <textarea
            rows={4}
            placeholder="Type your draft interview question here (e.g. 'How does database connection pooling prevent exhaustion under concurrent load?')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Sparkles size={16} />}
          >
            {isSubmitting ? 'Evaluating Readiness...' : 'Test Question Quality'}
          </Button>
        </div>
      </form>

      {/* Assessment Outcome Display */}
      {assessmentResult && (
        <div
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                Readiness Indicators & Feedback
              </h2>
            </div>
            <Badge variant="reviewed">Saved as Draft</Badge>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Character Length
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                {assessmentResult.indicators?.length || prompt.length} characters
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Readiness State
              </div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                {assessmentResult.indicators?.readiness || 'Ready for Review'}
              </div>
            </div>
          </div>

          {assessmentResult.draftRewrite && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderLeft: '3px solid var(--color-primary)',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                Calibrated Draft Suggestion:
              </div>
              <div style={{ fontStyle: 'italic', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                "{assessmentResult.draftRewrite}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionLabPage;
