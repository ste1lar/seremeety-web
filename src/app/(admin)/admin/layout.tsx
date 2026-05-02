import type { ReactNode } from 'react';
import AdminLayout from '@/features/admin/AdminLayout';
import AdminRouteGate from '@/shared/providers/AdminRouteGate';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AdminRouteGate>
      <AdminLayout>{children}</AdminLayout>
    </AdminRouteGate>
  );
}
