'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
import {
  createDefaultEntitlement,
  getEntitlementByUserId,
} from '@/shared/lib/firebase/entitlements';
import {
  createDefaultIdentityVerification,
  getIdentityVerificationByUserId,
} from '@/shared/lib/firebase/identityVerifications';
import {
  createNewUserV2,
  getUserV2ByUid,
  setOnboardingStatus,
} from '@/shared/lib/firebase/usersV2';
import OnboardingStubLayout from './OnboardingStubLayout';

// /onboarding/bootstrap
// Phone Auth 직후 진입 지점. User v2 / Entitlement / IdentityVerification
// 기본 문서를 보장하고 onboardingStatus를 'profile_required'로 전이한 뒤
// /onboarding/profile로 라우팅한다.
const BootstrapPage = () => {
  const router = useRouter();
  const { currentUser } = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!currentUser || ranRef.current) {
      return;
    }
    ranRef.current = true;

    const bootstrap = async () => {
      try {
        const uid = currentUser.uid;

        let user = await getUserV2ByUid(uid);
        if (!user) {
          await createNewUserV2(uid, currentUser.phoneNumber ?? '');
          user = await getUserV2ByUid(uid);
        }

        const [ent, ident] = await Promise.all([
          getEntitlementByUserId(uid),
          getIdentityVerificationByUserId(uid),
        ]);
        if (!ent) {
          await createDefaultEntitlement(uid);
        }
        if (!ident) {
          await createDefaultIdentityVerification(uid);
        }

        if (user && user.onboardingStatus === 'auth_only') {
          await setOnboardingStatus(uid, 'profile_required');
        }

        router.replace('/onboarding/profile');
      } catch (err) {
        console.error(err);
        setError('초기 설정 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
        ranRef.current = false;
      }
    };

    void bootstrap();
  }, [currentUser, router]);

  if (error) {
    return (
      <OnboardingStubLayout
        step="STEP 1 / 6"
        title="오류"
        description={error}
        primaryAction={{ label: '다시 시도', onClick: () => router.refresh() }}
      />
    );
  }

  return (
    <OnboardingStubLayout
      step="STEP 1 / 6"
      title="환영합니다"
      description="잠시만 기다려주세요. 초기 설정을 준비하고 있어요."
    />
  );
};

export default BootstrapPage;
