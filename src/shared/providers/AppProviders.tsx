'use client';

import { Provider as ReduxProvider } from 'react-redux';
import type { ReactNode } from 'react';
import { AuthSync } from '@/shared/providers/AuthSync';
import { store } from '@/shared/lib/store/store';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <AuthSync>{children}</AuthSync>
    </ReduxProvider>
  );
}
