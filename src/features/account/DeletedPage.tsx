'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import OnboardingStubLayout from '@/features/onboarding/OnboardingStubLayout';

const DeletedPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  return (
    <OnboardingStubLayout
      title="탈퇴된 계정입니다"
      description="이 계정으로는 더 이상 서비스를 이용할 수 없어요."
      primaryAction={{ label: '로그아웃', onClick: handleLogout }}
    />
  );
};

export default DeletedPage;
