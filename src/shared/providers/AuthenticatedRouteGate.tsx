'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MatchingProvider } from '@/features/matching/context/MatchingContext';
import { MypageProvider } from '@/features/profile/context/MypageContext';
import Loading from '@/shared/components/common/loading/Loading';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import type { ReactNode } from 'react';

interface AuthenticatedRouteGateProps {
  children: ReactNode;
}

export default function AuthenticatedRouteGate({ children }: AuthenticatedRouteGateProps) {
  const router = useRouter();
  const { currentUser, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return <Loading variant="page" />;
  }

  return (
    <MatchingProvider>
      <MypageProvider>{children}</MypageProvider>
    </MatchingProvider>
  );
}
