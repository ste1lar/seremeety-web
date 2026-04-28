import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { OnboardingStatus, User } from '@/shared/types/model/user';

// 신규 도메인 모델 기준 users/{uid} 문서 접근.
// 같은 users 컬렉션을 공유하지만 onboardingStatus / role / status / authProvider
// 필드 유무로 신규 vs old-shape를 구분한다.
// 기존 lib/firebase/users.ts(old UserProfile shape)는 Slice 2-C까지 유지된다.

const COLLECTION = 'users';

export const getUserV2ByUid = async (uid: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, uid));
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  if (typeof data.onboardingStatus !== 'string') {
    return null;
  }
  return { id: docSnap.id, ...(data as Omit<User, 'id'>) };
};

export const hasUserDoc = async (uid: string): Promise<boolean> => {
  const docSnap = await getDoc(doc(db, COLLECTION, uid));
  return docSnap.exists();
};

export const createNewUserV2 = async (
  uid: string,
  phoneNumberMasked?: string
): Promise<void> => {
  await setDoc(
    doc(db, COLLECTION, uid),
    {
      authProvider: 'firebase_phone',
      phoneAuthVerified: true,
      phoneNumberMasked: phoneNumberMasked ?? '',
      role: 'user',
      status: 'active',
      onboardingStatus: 'auth_only',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// 기존 old-shape 사용자가 처음 로그인할 때 grandfather 필드를 채워준다.
// onboardingStatus를 'approved'로 마크하여 기존 사용자가 끊김없이 /matching에 진입.
export const grandfatherExistingUser = async (uid: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, uid), {
    authProvider: 'firebase_phone',
    phoneAuthVerified: true,
    role: 'user',
    status: 'active',
    onboardingStatus: 'approved',
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
};

export const setOnboardingStatus = async (
  uid: string,
  onboardingStatus: OnboardingStatus
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, uid), {
    onboardingStatus,
    updatedAt: serverTimestamp(),
  });
};

export const updateLastLogin = async (uid: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
