import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layout & Guards
import { AppShell } from '../components/ui/AppShell';
import { RequireAuth, RequireRole } from '../components/ui/RouteGuard';
import { NotFoundPage } from '../components/ui/NotFoundPage';
import { PlaceholderRoute } from '../components/ui/PlaceholderRoute';

// Dev 1 Owned Pages (Matching Step 2 route-to-page specification)
import { LandingPage } from '../features/landing/LandingPage';
import { AuthPage } from '../features/auth/AuthPage';
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage';
import { PasswordResetPage } from '../features/auth/PasswordResetPage';
import { OnboardingPage } from '../features/auth/OnboardingPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { SettingsPage } from '../features/dashboard/SettingsPage';
import { AdminQuestionsPage } from '../features/admin/AdminQuestionsPage';
import { AdminAssignmentsPage } from '../features/admin/AdminAssignmentsPage';

// Dev 2 Owned Pages
import { InterviewSetupPage, InterviewRoomPage } from '../features/interview';

// Dev 3 Owned Pages
import { ReportPage } from '../features/reports/ReportPage';
import { ReplayPage } from '../features/replay/ReplayPage';
import { RetryPage } from '../features/retries/RetryPage';
import { ExpertDashboard, ExpertSessionPage, QuestionLabPage } from '../features/expert';

const router = createBrowserRouter([
  // Public Landing Page
  {
    path: '/',
    element: <LandingPage />,
  },

  // Auth Workflows
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/auth/reset',
    element: <PasswordResetPage />,
  },

  // Candidate Onboarding (Protected)
  {
    path: '/onboarding',
    element: (
      <RequireAuth>
        <OnboardingPage />
      </RequireAuth>
    ),
  },

  // Candidate Dashboard & Workspace (Protected)
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppShell>
          <DashboardPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/app/settings',
    element: (
      <RequireAuth>
        <AppShell>
          <SettingsPage />
        </AppShell>
      </RequireAuth>
    ),
  },

  // Admin Routes (Protected by Admin Role Guard)
  {
    path: '/admin/questions',
    element: (
      <RequireRole allowedRoles={['admin']}>
        <AppShell>
          <AdminQuestionsPage />
        </AppShell>
      </RequireRole>
    ),
  },
  {
    path: '/admin/assignments',
    element: (
      <RequireRole allowedRoles={['admin']}>
        <AppShell>
          <AdminAssignmentsPage />
        </AppShell>
      </RequireRole>
    ),
  },

  // Dev 2 Routes: Technical Interview Setup & Live Boardroom Simulation
  {
    path: '/app/interviews/new',
    element: (
      <RequireAuth>
        <AppShell>
          <InterviewSetupPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/app/interviews/:id',
    element: (
      <RequireAuth>
        <AppShell>
          <InterviewRoomPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    // Alias for single interview path
    path: '/app/interview/:id',
    element: (
      <RequireAuth>
        <AppShell>
          <InterviewRoomPage />
        </AppShell>
      </RequireAuth>
    ),
  },

  // Dev 3 Routes: Complete Implementation
  {
    path: '/app/interviews/:id/report',
    element: (
      <RequireAuth>
        <AppShell>
          <ReportPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/app/interviews/:id/replay',
    element: (
      <RequireAuth>
        <AppShell>
          <ReplayPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/app/retries/:id',
    element: (
      <RequireAuth>
        <AppShell>
          <RetryPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/expert',
    element: (
      <RequireAuth>
        <AppShell>
          <ExpertDashboard />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/expert/sessions/:id',
    element: (
      <RequireAuth>
        <AppShell>
          <ExpertSessionPage />
        </AppShell>
      </RequireAuth>
    ),
  },
  {
    path: '/expert/question-lab',
    element: (
      <RequireAuth>
        <AppShell>
          <QuestionLabPage />
        </AppShell>
      </RequireAuth>
    ),
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
