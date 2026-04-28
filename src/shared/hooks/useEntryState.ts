'use client';

import { useEffect, useState } from 'react';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import { getUserV2ByUid } from '@/shared/lib/firebase/usersV2';
import { getProfileByUserId } from '@/shared/lib/firebase/profiles';
import { getPreferenceByUserId } from '@/shared/lib/firebase/preferences';
import { getProfilePhotosByUserId } from '@/shared/lib/firebase/profilePhotos';
import { getLatestConsentByUserId } from '@/shared/lib/firebase/consents';
import type { UserEntryState } from '@/shared/lib/onboarding/resolveEntryRoute';

interface UseEntryStateResult {
  entryState: UserEntryState | null;
  isLoading: boolean;
  isError: boolean;
  refresh: () => Promise<void>;
}

const REQUIRED_TERMS_VERSION = '1.0';
const REQUIRED_PRIVACY_VERSION = '1.0';

export function useEntryState(): UseEntryStateResult {
  const { currentUser, isLoading: isAuthLoading } = useAuthSession();
  const [entryState, setEntryState] = useState<UserEntryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = async () => {
    if (isAuthLoading) {
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      if (!currentUser) {
        setEntryState({
          authenticated: false,
          user: null,
          profile: null,
          hasRequiredPhotos: false,
          preference: null,
          hasRequiredConsents: false,
        });
        return;
      }

      const uid = currentUser.uid;
      const [user, profile, preference, photos, consent] = await Promise.all([
        getUserV2ByUid(uid),
        getProfileByUserId(uid),
        getPreferenceByUserId(uid),
        getProfilePhotosByUserId(uid),
        getLatestConsentByUserId(uid),
      ]);

      const hasRequiredPhotos = photos.some(
        (p) => p.isMain && (p.status === 'approved' || p.status === 'pending')
      );

      const hasRequiredConsents = Boolean(
        consent &&
          consent.termsVersion === REQUIRED_TERMS_VERSION &&
          consent.privacyVersion === REQUIRED_PRIVACY_VERSION
      );

      setEntryState({
        authenticated: true,
        user,
        profile,
        hasRequiredPhotos,
        preference,
        hasRequiredConsents,
      });
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, isAuthLoading]);

  return {
    entryState,
    isLoading: isLoading || isAuthLoading,
    isError,
    refresh: load,
  };
}
