import type { ReactNode } from 'react';
import AppShell from '@/shared/layouts/app-shell/AppShell';
import AuthenticatedRouteGate from '@/shared/providers/AuthenticatedRouteGate';

interface DetailLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: DetailLayoutProps) {
  return (
    <AppShell>
      <AuthenticatedRouteGate>{children}</AuthenticatedRouteGate>
    </AppShell>
  );
}
