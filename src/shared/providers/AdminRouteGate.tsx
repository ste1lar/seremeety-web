'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/shared/components/common/loading/Loading';
import {
  selectAuthRole,
  selectAuthUid,
  selectIsAuthLoading,
} from '@/shared/lib/store/authSlice';
import { useAppSelector } from '@/shared/lib/store/hooks';
import type { ReactNode } from 'react';

interface AdminRouteGateProps {
  children: ReactNode;
}

// /admin 라우트 보호. 로그인 + role==='admin' 둘 다 만족해야 통과.
// admin 권한이 없으면 /matching 또는 /로 리다이렉트.
// TODO(Phase 3): 클라이언트 측 가드는 Security Rules로 보강돼야 한다.
// 현재는 Firestore에 admin 전용 read/write를 허용할 때 rule에서도 role 검증 필요.
export default function AdminRouteGate({ children }: AdminRouteGateProps) {
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const role = useAppSelector(selectAuthRole);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!uid) {
      router.replace('/');
      return;
    }
    if (role !== 'admin') {
      router.replace('/matching');
    }
  }, [uid, role, isAuthLoading, router]);

  if (isAuthLoading || !uid || role !== 'admin') {
    return <Loading variant="page" />;
  }

  return <>{children}</>;
}
