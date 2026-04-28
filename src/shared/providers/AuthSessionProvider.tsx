'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/firebase';
import { getUserDataByUid, setNewUserData } from '@/shared/lib/firebase/users';
import { getUserV2ByUid, grandfatherExistingUser } from '@/shared/lib/firebase/usersV2';
import type { AuthSessionValue } from '@/shared/types/domain';

const AuthSessionContext = createContext<AuthSessionValue>({
  currentUser: null,
  isLoading: true,
});

interface AuthSessionProviderProps {
  children: ReactNode;
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsInitializing(true);

      if (user) {
        setCurrentUser(user);

        try {
          const userData = await getUserDataByUid(user.uid);

          if (!userData) {
            // 신규 사용자: old-shape 기본 문서 + 신규 도메인 모델 부트스트랩은
            // /onboarding/bootstrap 페이지에서 처리한다 (User v2 / Entitlement /
            // IdentityVerification 생성). 여기서는 old-shape만 만들어 기존 페이지
            // 호환을 보장.
            await setNewUserData(user);
          } else {
            // 기존 사용자(old-shape doc만 있음): User v2 필드가 없으면 grandfather.
            // onboardingStatus = 'approved'로 마크해 기존 흐름 그대로 /matching 진입.
            const userV2 = await getUserV2ByUid(user.uid);
            if (!userV2) {
              await grandfatherExistingUser(user.uid);
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsCurrentUserReady(true);
        }
      } else {
        setCurrentUser(null);
        setIsCurrentUserReady(false);
      }

      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthSessionValue>(
    () => ({
      currentUser,
      isLoading: isInitializing || (Boolean(currentUser) && !isCurrentUserReady),
    }),
    [currentUser, isCurrentUserReady, isInitializing]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
