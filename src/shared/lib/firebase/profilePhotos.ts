import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { ProfilePhoto } from '@/shared/types/model/photo';

const COLLECTION = 'profilePhotos';

// Firestore composite index를 요구하지 않도록 where(userId)만 서버에서 필터하고
// status / order는 클라이언트에서 처리한다. 사진 수가 사용자당 작아서 비용 부담 없음.
export const getProfilePhotosByUserId = async (userId: string): Promise<ProfilePhoto[]> => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ProfilePhoto, 'id'>) }))
    .filter((p) => p.status !== 'deleted')
    .sort((a, b) => a.order - b.order);
};

export const createProfilePhoto = async (
  userId: string,
  profileId: string,
  partial: Omit<
    ProfilePhoto,
    'id' | 'userId' | 'profileId' | 'status' | 'createdAt' | 'updatedAt'
  >
): Promise<string> => {
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    userId,
    profileId,
    ...partial,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProfilePhoto = async (
  photoId: string,
  data: Partial<Omit<ProfilePhoto, 'id' | 'userId' | 'profileId' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, photoId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
