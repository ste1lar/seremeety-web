import type { ReactNode } from 'react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthenticatedLayoutProps) {
  return children;
}
