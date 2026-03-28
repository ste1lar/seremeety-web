'use client';

import type { ReactNode } from 'react';
import { AuthSessionProvider } from '@/shared/providers/AuthSessionProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
