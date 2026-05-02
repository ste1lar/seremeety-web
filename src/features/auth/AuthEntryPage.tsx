'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/features/auth/LoginPage';
import Loading from '@/shared/components/common/loading/Loading';
import { useAppSelector } from '@/shared/lib/store/hooks';
import {
  selectAuthUid,
  selectIsAuthLoading,
} from '@/shared/lib/store/authSlice';
import { useEntryState } from '@/shared/hooks/useEntryState';
import { resolveEntryRoute } from '@/shared/lib/onboarding/resolveEntryRoute';

export default function AuthEntryPage() {
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);
  const { entryState, isLoading: isEntryLoading } = useEntryState();

  useEffect(() => {
    if (isAuthLoading || isEntryLoading) {
      return;
    }
    if (!uid || !entryState) {
      return;
    }
    const next = resolveEntryRoute(entryState);
    if (next !== '/') {
      router.replace(next);
    }
  }, [uid, entryState, isAuthLoading, isEntryLoading, router]);

  if (isAuthLoading || (uid && isEntryLoading)) {
    return <Loading variant="page" />;
  }
  if (uid) {
    return <Loading variant="page" />;
  }

  return <LoginPage />;
}
