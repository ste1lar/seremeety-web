'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/features/auth/LoginPage';
import Loading from '@/shared/components/common/loading/Loading';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';

export default function AuthEntryPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace('/matching');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser) {
    return <Loading variant="page" />;
  }

  return <LoginPage />;
}
