import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';

export function OnboardingPage() {
  const { user, profile, updateProfile, token, devMode } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [domain, setDomain] = useState(profile?.domain || 'computer_science');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'junior');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'backend_developer');

  const [catalog, setCatalog] = useState(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch catalog from GET /api/v1/catalog
  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      setIsLoadingCatalog(true);
      try {
        if (!devMode && token) {
          const res = await apiClient.get('catalog');
          if (mounted && res?.data) {
            setCatalog(res.data);
          }
        }
      } catch (err) {
        console.warn('Catalog endpoint unavailable, using contract defaults:', err.message);
      } finally {
        if (mounted) setIsLoadingCatalog(false);
      }
    }
    loadCatalog();
    return () => { mounted = false; };
  }, [token, devMode]);

  // Prepopulate if profile exists
  useEffect(() => {
    if (profile) {
      if (profile.displayName) setDisplayName(profile.displayName);
      if (profile.domain) setDomain(profile.domain);
      if (profile.experienceLevel) setExperienceLevel(profile.experienceLevel);
      if (profile.targetRole) setTargetRole(profile.targetRole);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (displayName.trim().length > 80) {
      setError('Display name must be 80 characters or fewer');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      displayName: displayName.trim(),
      domain: 'computer_science',
      experienceLevel,
      // Target role MUST be the catalog slug e.g. "backend_developer"
      targetRole,
    };

    try {
      await updateProfile(payload);
      toast.success('Candidate profile initialized.');
      navigate('/app');
    } catch (err) {
      console.error('Onboarding save error:', err);
      setError(err.message || 'Failed to save candidate profile. Please check the backend connection.');
      toast.error(err.message || 'Profile setup failed');
    } finally {
      setIsSaving(false);
    }
  };

  const domainOptions = [
    { value: 'computer_science', label: 'Computer Science (v1 supported domain)' },
  ];

  const levelOptions = [
    { value: 'junior', label: 'Junior (Foundation engineering & core APIs)' },
    { value: 'intermediate', label: 'Intermediate (System design, concurrency, reliability)' },
  ];

  const roleOptions = catalog?.roles?.map((r) => ({ value: r.slug, label: r.label })) || [
    { value: 'backend_developer', label: 'Backend Developer' },
    { value: 'frontend_engineer', label: 'Frontend Engineer' },
    { value: 'full_stack_engineer', label: 'Full Stack Engineer' },
    { value: 'system_design_engineer', label: 'System Design Engineer' },
    { value: 'devops_cloud_engineer', label: 'DevOps / Cloud Engineer' },
    { value: 'data_engineer', label: 'Data Engineer' },
    { value: 'qa_automation_engineer', label: 'QA / Automation Engineer' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          padding: '2.5rem 2.25rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Candidate Profile Setup
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Welcome to PanelIQ
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: '0.5rem',
              lineHeight: 1.6,
            }}
          >
            Configure your technical focus. Question bank selection matches approved domain, role, and experience level criteria.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input
            label="Display name"
            placeholder="e.g. Alex Chen"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            helperText="Maximum 80 characters. Visible on session transcripts and feedback reports."
          />

          <Select
            label="Engineering domain"
            options={domainOptions}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            helperText="v1 scope is strictly Computer Science; additional domains deferred."
          />

          <Select
            label="Experience level"
            options={levelOptions}
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            helperText="Calibrates the 8 base prompts: icebreakers, technical depth, and managerial trade-offs."
          />

          <Select
            label="Target role"
            options={roleOptions}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            helperText="Stored as the catalog slug 'backend_developer' per backend contract requirements."
          />

          {error && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid rgba(184, 56, 56, 0.2)',
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

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              style={{ width: '100%' }}
              rightIcon={<ArrowRight size={18} />}
            >
              Save profile and enter workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;
