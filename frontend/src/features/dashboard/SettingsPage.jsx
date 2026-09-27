import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Trash2,
  Info,
  Save,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog, DialogFooter } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';

export function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [domain, setDomain] = useState(profile?.domain || 'computer_science');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'junior');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'backend_developer');

  // Sync profile when fetched from backend
  React.useEffect(() => {
    if (profile) {
      if (profile.displayName) setDisplayName(profile.displayName);
      if (profile.domain) setDomain(profile.domain);
      if (profile.experienceLevel) setExperienceLevel(profile.experienceLevel);
      if (profile.targetRole) setTargetRole(profile.targetRole);
    }
  }, [profile]);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error('Display name cannot be empty');
      return;
    }
    if ([...trimmed].length > 80) {
      toast.error('Display name cannot exceed 80 characters');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        displayName: trimmed,
        domain,
        experienceLevel,
        targetRole,
      });
      toast.success('Candidate profile updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSessionConfirm = async () => {
    setIsDeleting(true);
    // PRD Section 14.2 & Backend Contract:
    // Backend has not yet implemented a DELETE endpoint for sessions.
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteNotice(
        'Deletion request acknowledged: Server endpoint DELETE /api/v1/sessions/:id is pending Dev 4 backend implementation. Local session draft cache has been cleared.'
      );
      try {
        sessionStorage.clear();
      } catch {
        // Ignore
      }
      toast.info('Local session draft cache cleared. Server deletion endpoint pending.');
    }, 600);
  };

  return (
    <div style={{ maxWidth: '840px', width: '100%' }}>
      <PageHeader
        title="Settings & Privacy"
        description="Manage your profile metadata, view privacy commitments, or configure session data retention."
      />

      {/* Profile Details Form */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <User size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Candidate Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            helperText="Maximum 80 characters. Visible on scorecards and reviewer notes."
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <Select
              label="Engineering domain"
              options={[{ value: 'computer_science', label: 'Computer Science' }]}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              helperText="v1 supported domain"
            />

            <Select
              label="Experience level"
              options={[
                { value: 'junior', label: 'Junior' },
                { value: 'intermediate', label: 'Intermediate' },
              ]}
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              helperText="Calibrates interview prompts"
            />
          </div>

          <Select
            label="Target role"
            options={[{ value: 'backend_developer', label: 'Backend Developer' }]}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            helperText="Persisted as backend_developer slug"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
            <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save size={16} />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Privacy Commitment */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Shield size={20} color="var(--color-success)" />
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Privacy & Data Integrity</h2>
        </div>

        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            <strong>Advisory AI Feedback:</strong> Candidate transcripts and scores are processed strictly to assist simulation practice and human evaluators. Automated scores require reviewed anchors and are not treated as employment decisions.
          </p>
          <p>
            <strong>Ownership & Isolation:</strong> Session answers and scorecards are protected by PostgreSQL Row-Level Security (RLS). Only your authenticated account and assigned evaluators have access.
          </p>
          <p>
            <strong>Zero Third-Party Ingestion:</strong> Your answers are never used to train generalized external models or shared with marketing providers.
          </p>
        </div>
      </div>

      {/* Danger Zone: Session Deletion */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid rgba(184, 56, 56, 0.25)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Trash2 size={20} color="var(--color-error)" />
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-error)' }}>
            Data Management
          </h2>
        </div>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Delete your simulation session data and clear local drafts from this browser.
        </p>

        {deleteNotice && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              marginBottom: '1.25rem',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <Info size={16} color="var(--color-info)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{deleteNotice}</span>
          </div>
        )}

        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          leftIcon={<Trash2 size={14} />}
        >
          Delete own session data
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Session Data Deletion"
        description="Are you sure you want to delete your candidate session history?"
      >
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '1rem' }}>
            This action will clear all local session drafts stored in your browser's session storage.
          </p>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <strong>Note on backend support:</strong> As defined in backend session contracts, server-side data purging is pending Task 9/10 implementation by Dev 4. This confirmation workflow exercises the frontend UI contract safely.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={async () => {
              await handleDeleteSessionConfirm();
              setDeleteDialogOpen(false);
            }}
          >
            Confirm & Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default SettingsPage;
