'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/shared/components/common/loading/Loading';
import { useAppSelector } from '@/shared/lib/store/hooks';
import {
  selectAuthUid,
  selectIsAuthLoading,
} from '@/shared/lib/store/authSlice';

export default function NotFoundRedirectPage() {
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    router.replace(uid ? '/matching' : '/');
  }, [uid, isLoading, router]);

  return <Loading variant="page" />;
}
