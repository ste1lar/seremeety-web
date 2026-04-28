'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import { getProfileByUserId } from '@/shared/lib/firebase/profiles';
import { setOnboardingStatus } from '@/shared/lib/firebase/usersV2';
import OnboardingStubLayout from './OnboardingStubLayout';

// /onboarding/rejected
// 관리자가 프로필을 반려한 후 표시. 사용자가 재작성하면
// onboardingStatus 'profile_required'로 되돌리고 profile step으로 라우팅.
const RejectedPage = () => {
  const router = useRouter();
  const { currentUser } = useAuthSession();
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const load = async () => {
      const profile = await getProfileByUserId(currentUser.uid);
      setReason(profile?.rejectionReason ?? null);
    };
    void load();
  }, [currentUser]);

  const handleRetry = async () => {
    if (!currentUser) {
      return;
    }
    await setOnboardingStatus(currentUser.uid, 'profile_required');
    router.replace('/onboarding/profile');
  };

  return (
    <OnboardingStubLayout
      title="프로필이 반려되었어요"
      description={reason ?? '관리자가 프로필을 검토한 결과 일부 수정이 필요해요.'}
      primaryAction={{ label: '다시 작성하기', onClick: handleRetry }}
    />
  );
};

export default RejectedPage;
