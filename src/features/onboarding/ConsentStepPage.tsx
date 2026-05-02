'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { useAppSelector } from '@/shared/lib/store/hooks';
import { selectAuthUid } from '@/shared/lib/store/authSlice';
import { createConsent } from '@/shared/lib/firebase/consents';
import { getProfileByUserId, updateProfile } from '@/shared/lib/firebase/profiles';
import { setOnboardingStatus } from '@/shared/lib/firebase/usersV2';
import { writeProfileStatusToLegacyUser } from '@/shared/lib/firebase/legacyBridge';
import OnboardingStubLayout from './OnboardingStubLayout';

// /onboarding/consent
// 약관/개인정보 동의 후 프로필을 심사 제출. profile.status -> 'pending',
// user.onboardingStatus -> 'review_pending'.
// 약관 텍스트 자체는 Phase 11 (운영/법무 검토) 영역. 여기서는 동의 사실만 기록.
const REQUIRED_TERMS_VERSION = '1.0';
const REQUIRED_PRIVACY_VERSION = '1.0';

const ConsentStepPage = () => {
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = agreedTerms && agreedPrivacy && !isSubmitting;

  const handleSubmit = async () => {
    if (!uid || !canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createConsent(uid, {
        termsVersion: REQUIRED_TERMS_VERSION,
        privacyVersion: REQUIRED_PRIVACY_VERSION,
        marketingAgreed: agreedMarketing,
        agreedAt: Timestamp.now(),
      });

      const profile = await getProfileByUserId(uid);
      if (profile) {
        await updateProfile(profile.id, {
          status: 'pending',
          submittedAt: Timestamp.now(),
        });
      }

      // /admin/profiles 큐에서 승인 후 onboardingStatus 'approved' 전이.
      // 그 전까지는 추천에서 제외되도록 legacy users.profileStatus도 0 유지.
      await writeProfileStatusToLegacyUser(uid, false);
      await setOnboardingStatus(uid, 'review_pending');
      router.replace('/onboarding/review-pending');
    } catch (err) {
      console.error(err);
      setError('제출 중 오류가 발생했어요.');
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingStubLayout
      step="STEP 5 / 6"
      title="약관 및 개인정보 동의"
      description="동의 후 프로필 심사가 시작됩니다. 약관 본문은 Phase 11에서 정식 텍스트로 교체됩니다."
      primaryAction={{
        label: isSubmitting ? '제출 중...' : '동의하고 심사 제출',
        onClick: handleSubmit,
        disabled: !canSubmit,
      }}
    >
      <label>
        <input
          type="checkbox"
          checked={agreedTerms}
          onChange={(e) => setAgreedTerms(e.target.checked)}
        />
        이용약관에 동의합니다 (필수)
      </label>
      <label>
        <input
          type="checkbox"
          checked={agreedPrivacy}
          onChange={(e) => setAgreedPrivacy(e.target.checked)}
        />
        개인정보처리방침에 동의합니다 (필수)
      </label>
      <label>
        <input
          type="checkbox"
          checked={agreedMarketing}
          onChange={(e) => setAgreedMarketing(e.target.checked)}
        />
        마케팅 정보 수신에 동의합니다 (선택)
      </label>
      {error && <p role="alert">{error}</p>}
    </OnboardingStubLayout>
  );
};

export default ConsentStepPage;
