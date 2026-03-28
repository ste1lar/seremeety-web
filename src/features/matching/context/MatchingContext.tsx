'use client';

import React, { useEffect, useReducer, useState, type ReactNode } from 'react';
import { auth } from '@/firebase';
import { getUserDataByUid, getUserProfiles } from '@/shared/lib/firebase/users';
import type { UserProfile } from '@/shared/types/domain';

interface MatchingAction {
  type: 'INIT';
  data: UserProfile[];
}

type FetchUserProfiles = () => Promise<void>;

const defaultFetchUserProfiles: FetchUserProfiles = async () => undefined;

export const MatchingStateContext = React.createContext<UserProfile[]>([]);
export const MatchingLoadingContext = React.createContext(true);
export const MatchingDispatchContext =
  React.createContext<FetchUserProfiles>(defaultFetchUserProfiles);

const reducer = (_state: UserProfile[], action: MatchingAction): UserProfile[] => action.data;

interface MatchingProviderProps {
  children: ReactNode;
}

export const MatchingProvider = ({ children }: MatchingProviderProps) => {
  const [state, dispatch] = useReducer(reducer, [] as UserProfile[]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfiles = async () => {
    setIsLoading(true);

    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUserData = await getUserDataByUid(currentUid);
      if (!currentUserData) {
        return;
      }

      const userProfiles = await getUserProfiles(currentUserData);
      dispatch({ type: 'INIT', data: userProfiles });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUserProfiles();
  }, []);

  return (
    <MatchingLoadingContext.Provider value={isLoading}>
      <MatchingStateContext.Provider value={state}>
        <MatchingDispatchContext.Provider value={fetchUserProfiles}>
          {children}
        </MatchingDispatchContext.Provider>
      </MatchingStateContext.Provider>
    </MatchingLoadingContext.Provider>
  );
};

export default MatchingProvider;
