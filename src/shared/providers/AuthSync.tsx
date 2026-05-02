'use client';

import { useEffect, type ReactNode } from 'react';
import { auth } from '@/firebase';
import { baseApi } from '@/shared/lib/api/baseApi';
import { useAppDispatch } from '@/shared/lib/store/hooks';
import {
  setAuthInitializing,
  setAuthReady,
  setAuthUid,
} from '@/shared/lib/store/authSlice';
import { getUserDataByUid, setNewUserData } from '@/shared/lib/firebase/users';
import { getUserV2ByUid, grandfatherExistingUser } from '@/shared/lib/firebase/usersV2';

interface AuthSyncProps {
  children: ReactNode;
}

// Firebase auth 구독을 Redux auth slice로 흘리는 side-effect-only 컴포넌트.
// Context를 제공하지 않는다 — children을 그대로 통과시키고 effect만 실행.
// 컴포넌트는 selector(`selectAuthUid`, `selectIsAuthLoading`)로 인증 상태를 읽고,
// Firebase User 메서드(getIdToken 등)가 필요한 곳은 모듈 글로벌인
// `auth.currentUser`를 직접 참조한다.
export function AuthSync({ children }: AuthSyncProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      dispatch(setAuthInitializing(true));

      if (user) {
        dispatch(setAuthUid(user.uid));
        dispatch(setAuthReady(false));

        try {
          const userData = await getUserDataByUid(user.uid);
          if (!userData) {
            // 신규 사용자: old-shape 기본 문서만 만들어 둔다. User v2 / Entitlement /
            // IdentityVerification 부트스트랩은 /onboarding/bootstrap에서 처리.
            await setNewUserData(user);
          } else {
            // 기존 사용자(old-shape doc만 있음): User v2 필드가 없으면 grandfather.
            const userV2 = await getUserV2ByUid(user.uid);
            if (!userV2) {
              await grandfatherExistingUser(user.uid);
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          dispatch(setAuthReady(true));
        }
      } else {
        dispatch(setAuthUid(null));
      }

      dispatch(setAuthInitializing(false));

      // 로그인/로그아웃 모두에서 사용자 종속 캐시를 무효화해 RTK Query가 새 uid 기준으로
      // 재페치/재구독하도록 한다.
      dispatch(
        baseApi.util.invalidateTags([
          'Me',
          'EntryState',
          'Message',
          'Recommendation',
          'Reaction',
          'Match',
          'Block',
          'Entitlement',
          'Photo',
        ])
      );
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
