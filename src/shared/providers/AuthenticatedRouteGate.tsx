'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/shared/components/common/loading/Loading';
import { useAppSelector } from '@/shared/lib/store/hooks';
import {
  selectAuthUid,
  selectIsAuthLoading,
} from '@/shared/lib/store/authSlice';
import { useEntryState } from '@/shared/hooks/useEntryState';
import { resolveEntryRoute } from '@/shared/lib/onboarding/resolveEntryRoute';
import type { ReactNode } from 'react';

interface AuthenticatedRouteGateProps {
  children: ReactNode;
}

export default function AuthenticatedRouteGate({ children }: AuthenticatedRouteGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useAppSelector(selectAuthUid);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);
  const { entryState, isLoading: isEntryLoading } = useEntryState();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!uid) {
      router.replace('/');
      return;
    }
    if (isEntryLoading || !entryState) {
      return;
    }
    const target = resolveEntryRoute(entryState);
    // resolveEntryRoute는 사용자의 "초기 진입점"만 결정한다.
    // - target이 /onboarding/* 또는 /account/*: 해당 단계에서만 머물러야 하므로 강제 이동
    // - target이 /matching (approved 상태): 모든 보호 라우트(mypage, chat-list 등) 자유 이동 허용
    const isGatedRoute =
      target.startsWith('/onboarding/') || target.startsWith('/account/');
    if (isGatedRoute && target !== pathname) {
      router.replace(target);
    }
  }, [uid, entryState, isAuthLoading, isEntryLoading, pathname, router]);

  if (isAuthLoading || !uid) {
    return <Loading variant="page" />;
  }
  if (isEntryLoading || !entryState) {
    return <Loading variant="page" />;
  }
  // gated 라우트로 이동 중일 때만 Loading 표시 (잘못된 페이지 깜빡임 방지)
  const target = resolveEntryRoute(entryState);
  const isGatedRoute =
    target.startsWith('/onboarding/') || target.startsWith('/account/');
  if (isGatedRoute && target !== pathname) {
    return <Loading variant="page" />;
  }

  return <>{children}</>;
}
