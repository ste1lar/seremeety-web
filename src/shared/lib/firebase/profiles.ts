import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Profile } from '@/shared/types/model/profile';

const COLLECTION = 'profiles';

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId), fsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    return null;
  }
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as Omit<Profile, 'id'>) };
};

export const getProfileById = async (profileId: string): Promise<Profile | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, profileId));
  if (!docSnap.exists()) {
    return null;
  }
  return { id: docSnap.id, ...(docSnap.data() as Omit<Profile, 'id'>) };
};

export const createDraftProfile = async (
  userId: string,
  partial: Partial<Omit<Profile, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>> = {}
): Promise<string> => {
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    userId,
    nickname: '',
    birthYear: 0,
    gender: 'male',
    location: '',
    bio: '',
    tags: [],
    ...partial,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProfile = async (
  profileId: string,
  data: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, profileId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
