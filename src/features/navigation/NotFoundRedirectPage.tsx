'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/shared/components/common/loading/Loading';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';

export default function NotFoundRedirectPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuthSession();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(currentUser ? '/matching' : '/');
  }, [currentUser, isLoading, router]);

  return <Loading variant="page" />;
}
