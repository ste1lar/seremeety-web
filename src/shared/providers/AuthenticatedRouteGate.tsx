'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MatchingProvider } from '@/features/matching/context/MatchingContext';
import { MypageProvider } from '@/features/profile/context/MypageContext';
import Loading from '@/shared/components/common/loading/Loading';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import { useEntryState } from '@/shared/hooks/useEntryState';
import { resolveEntryRoute } from '@/shared/lib/onboarding/resolveEntryRoute';
import type { ReactNode } from 'react';

interface AuthenticatedRouteGateProps {
  children: ReactNode;
}

export default function AuthenticatedRouteGate({ children }: AuthenticatedRouteGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading: isAuthLoading } = useAuthSession();
  const { entryState, isLoading: isEntryLoading } = useEntryState();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!currentUser) {
      router.replace('/');
      return;
    }
    if (isEntryLoading || !entryState) {
      return;
    }
    const target = resolveEntryRoute(entryState);
    if (target !== pathname) {
      router.replace(target);
    }
  }, [currentUser, entryState, isAuthLoading, isEntryLoading, pathname, router]);

  if (isAuthLoading || !currentUser) {
    return <Loading variant="page" />;
  }
  if (isEntryLoading || !entryState) {
    return <Loading variant="page" />;
  }
  // 가드가 redirect를 트리거하는 동안에도 잘못된 페이지가 잠시 보이지 않도록
  // pathname이 target과 다르면 Loading을 보여준다.
  const target = resolveEntryRoute(entryState);
  if (target !== pathname) {
    return <Loading variant="page" />;
  }

  return (
    <MatchingProvider>
      <MypageProvider>{children}</MypageProvider>
    </MatchingProvider>
  );
}
