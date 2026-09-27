import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { AuthProvider } from '../lib/auth-context';
import { ToastProvider } from '../components/ui/Toast';

/**
 * Root Application Providers
 * Wraps the app with TanStack Query, AuthContext, and ToastProvider.
 */
export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
