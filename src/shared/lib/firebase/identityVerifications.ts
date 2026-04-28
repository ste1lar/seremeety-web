import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { IdentityVerification } from '@/shared/types/model/identity';

const COLLECTION = 'identityVerifications';

export const getIdentityVerificationByUserId = async (
  userId: string
): Promise<IdentityVerification | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, userId));
  if (!docSnap.exists()) {
    return null;
  }
  return { id: docSnap.id, ...(docSnap.data() as Omit<IdentityVerification, 'id'>) };
};

export const createDefaultIdentityVerification = async (userId: string): Promise<void> => {
  await setDoc(doc(db, COLLECTION, userId), {
    userId,
    provider: 'none',
    status: 'not_started',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
