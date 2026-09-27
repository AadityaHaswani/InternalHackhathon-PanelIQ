import React, { useState } from 'react';
import {
  Search,
  Filter,
  Info,
  ChevronRight,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { MOCK_ADMIN_QUESTIONS } from '../../mocks/admin/admin.fixtures';

export function AdminQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const filteredQuestions = MOCK_ADMIN_QUESTIONS.filter((q) => {
    const matchesSearch =
      q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = stageFilter === 'all' || q.stage === stageFilter;
    const matchesLevel = levelFilter === 'all' || q.level === levelFilter;
    return matchesSearch && matchesStage && matchesLevel;
  });

  const columns = [
    {
      header: 'Question ID & Stage',
      key: 'id',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.id}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            {row.stage.replace('_', ' ')} • {row.level}
          </div>
        </div>
      ),
    },
    {
      header: 'Prompt Preview',
      key: 'prompt',
      render: (row) => (
        <p
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            maxWidth: '460px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.prompt}
        </p>
      ),
    },
    {
      header: 'Topics',
      key: 'topics',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {row.topics.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-surface-subtle)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'published' ? 'reviewed' : 'draft'}>
          {row.status === 'published' ? 'Published' : 'Draft (v1)'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedQuestion(row)}
          rightIcon={<ChevronRight size={14} />}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <PageHeader
        title="Question Bank Administration"
        description="Review question drafts, inspect evaluation rubric notes, and audit domain-level coverage."
      />

      {/* Honest Backend Status Banner */}
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
            The live backend currently stores 32 draft questions in PostgreSQL (`public.question_versions`), with manual human review handled via SQL Editor as documented in `backend/docs/question-review.md`. Application endpoints for admin CRUD (`/api/v1/admin/questions`) have not yet been implemented by Dev 4. Displaying verified seed fixtures below.
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '0.875rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ gridColumn: 'span 1' }}>
          <Input
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 0 }}
            aria-label="Search questions"
          />
        </div>

        <div>
          <Select
            options={[
              { value: 'all', label: 'All stages' },
              { value: 'icebreaker', label: 'Icebreaker' },
              { value: 'technical', label: 'Technical' },
              { value: 'techno_managerial', label: 'Techno-Managerial' },
              { value: 'reflection', label: 'Reflection' },
            ]}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            aria-label="Filter by stage"
          />
        </div>

        <div>
          <Select
            options={[
              { value: 'all', label: 'All levels' },
              { value: 'junior', label: 'Junior' },
              { value: 'intermediate', label: 'Intermediate' },
            ]}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            aria-label="Filter by level"
          />
        </div>
      </div>

      {/* Questions Data Table with accessible horizontal scroll */}
      <DataTable
        columns={columns}
        data={filteredQuestions}
        ariaLabel="Admin questions table"
        emptyMessage="No questions match the selected stage and level criteria."
        onRowClick={(row) => setSelectedQuestion(row)}
      />

      {/* Question Details Drawer / Modal */}
      {selectedQuestion && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 'min(100vw, 520px)',
            backgroundColor: 'var(--color-surface)',
            borderLeft: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-elevated)',
            zIndex: 50,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="question-drawer-title"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Badge variant={selectedQuestion.status === 'published' ? 'reviewed' : 'draft'}>
                {selectedQuestion.status === 'published' ? 'Published Version 1' : 'Unreviewed Draft (v1)'}
              </Badge>
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{ padding: '0.5rem', color: 'var(--color-text-muted)', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close question drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              ID: {selectedQuestion.id}
            </div>

            <h3 id="question-drawer-title" style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'var(--font-serif)', fontWeight: 600, lineHeight: 1.4, marginBottom: '1.25rem' }}>
              "{selectedQuestion.prompt}"
            </h3>

            {selectedQuestion.followUp && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                  Reviewed Follow-up
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {selectedQuestion.followUp}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Required Reasoning Concepts
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {selectedQuestion.concepts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Rubric Notes & Guidelines
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {selectedQuestion.rubricNotes}
              </p>
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Publication is performed in SQL Editor with reviewer attribution per PRD Section 14.5.
            </div>
            <Button variant="secondary" style={{ width: '100%' }} onClick={() => setSelectedQuestion(null)}>
              Close Drawer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminQuestionsPage;
