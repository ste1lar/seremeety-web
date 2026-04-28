'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import OnboardingStubLayout from '@/features/onboarding/OnboardingStubLayout';

const SuspendedPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  return (
    <OnboardingStubLayout
      title="이용이 제한된 계정입니다"
      description="고객센터로 문의해주세요. 운영 정책 위반에 따라 일시적으로 서비스 이용이 제한되었어요."
      primaryAction={{ label: '로그아웃', onClick: handleLogout }}
    />
  );
};

export default SuspendedPage;
