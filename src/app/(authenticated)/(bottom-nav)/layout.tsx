import type { ReactNode } from 'react';
import AppShell from '@/shared/layouts/app-shell/AppShell';
import AuthenticatedRouteGate from '@/shared/providers/AuthenticatedRouteGate';

interface BottomNavLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: BottomNavLayoutProps) {
  return (
    <AppShell showBottomMenu>
      <AuthenticatedRouteGate>{children}</AuthenticatedRouteGate>
    </AppShell>
  );
}
