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
    const handleContextMenu = (event: Event) => event.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsInitializing(true);

      if (user) {
        setCurrentUser(user);

        try {
          const userData = await getUserDataByUid(user.uid);

          if (!userData) {
            await setNewUserData(user);
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
