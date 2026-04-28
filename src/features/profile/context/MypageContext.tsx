'use client';

import React, { useEffect, useReducer, useState, type ReactNode } from 'react';
import {
  compressImage,
  dataURLToFile,
  uploadImageToStorage,
} from '@/shared/lib/media';
import {
  getUserDataByUid,
  updateUserDataByUid,
} from '@/shared/lib/firebase/users';
import { auth } from '@/firebase';
import type { UserProfile } from '@/shared/types/domain';

interface MypageAction {
  type: 'INIT' | 'UPDATE';
  data: UserProfile;
}

interface UpdateProfileResult {
  message?: string;
  success: boolean;
}

interface MypageDispatchValue {
  onUpdate: (newData: UserProfile) => Promise<UpdateProfileResult>;
  onUpdateCoin: (newData: UserProfile) => Promise<void>;
}

interface MypageStatusValue {
  isFetching: boolean;
  isFetchError: boolean;
  isUpdating: boolean;
}

const defaultDispatchValue: MypageDispatchValue = {
  onUpdate: async () => ({ success: false }),
  onUpdateCoin: async () => undefined,
};

const defaultStatusValue: MypageStatusValue = {
  isFetching: true,
  isFetchError: false,
  isUpdating: false,
};

export const MypageStateContext = React.createContext<UserProfile | null>(null);
export const MypageStatusContext = React.createContext<MypageStatusValue>(defaultStatusValue);
export const MypageDispatchContext =
  React.createContext<MypageDispatchValue>(defaultDispatchValue);

const reducer = (_state: UserProfile | null, action: MypageAction): UserProfile => action.data;

interface MypageProviderProps {
  children: ReactNode;
}

export const MypageProvider = ({ children }: MypageProviderProps) => {
  const [state, dispatch] = useReducer(reducer, null as UserProfile | null);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchError, setIsFetchError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        setIsFetching(false);
        return;
      }

      try {
        const userData = await getUserDataByUid(currentUid);
        if (userData) {
          dispatch({ type: 'INIT', data: userData });
        }
      } catch (error) {
        console.error(error);
        setIsFetchError(true);
      } finally {
        setIsFetching(false);
      }
    };

    void fetchUserProfile();
  }, []);

  const onUpdate = async (newData: UserProfile) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid || !state) {
      return {
        message: '오류가 발생했습니다',
        success: false,
      };
    }

    setIsUpdating(true);

    try {
      const nextData = { ...newData };

      if (
        nextData.profilePictureUrl !== state.profilePictureUrl &&
        nextData.profilePictureUrl.startsWith('data:')
      ) {
        const file = dataURLToFile(nextData.profilePictureUrl, 'profile_picture.jpg');
        const compressed = await compressImage(file);
        const uploadedUrl = await uploadImageToStorage(compressed, currentUid);
        nextData.profilePictureUrl = uploadedUrl;
      }

      await updateUserDataByUid(currentUid, nextData);
      dispatch({
        type: 'UPDATE',
        data: nextData,
      });
      return {
        message: '성공적으로 저장되었습니다!',
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        message: '오류가 발생했습니다',
        success: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const onUpdateCoin = async (newData: UserProfile) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      return;
    }

    try {
      await updateUserDataByUid(currentUid, newData);
      dispatch({
        type: 'UPDATE',
        data: newData,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MypageStatusContext.Provider value={{ isFetching, isFetchError, isUpdating }}>
      <MypageStateContext.Provider value={state}>
        <MypageDispatchContext.Provider value={{ onUpdate, onUpdateCoin }}>
          {children}
        </MypageDispatchContext.Provider>
      </MypageStateContext.Provider>
    </MypageStatusContext.Provider>
  );
};

export default MypageProvider;
