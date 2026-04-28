'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/features/auth/LoginPage';
import Loading from '@/shared/components/common/loading/Loading';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import { useEntryState } from '@/shared/hooks/useEntryState';
import { resolveEntryRoute } from '@/shared/lib/onboarding/resolveEntryRoute';

export default function AuthEntryPage() {
  const router = useRouter();
  const { currentUser, isLoading: isAuthLoading } = useAuthSession();
  const { entryState, isLoading: isEntryLoading } = useEntryState();

  useEffect(() => {
    if (isAuthLoading || isEntryLoading) {
      return;
    }
    if (!currentUser || !entryState) {
      return;
    }
    const next = resolveEntryRoute(entryState);
    if (next !== '/') {
      router.replace(next);
    }
  }, [currentUser, entryState, isAuthLoading, isEntryLoading, router]);

  if (isAuthLoading || (currentUser && isEntryLoading)) {
    return <Loading variant="page" />;
  }
  if (currentUser) {
    return <Loading variant="page" />;
  }

  return <LoginPage />;
}
