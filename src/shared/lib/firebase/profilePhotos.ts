import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { toPlainTimestamps } from '@/shared/lib/firebase/serialize';
import type { ProfilePhoto } from '@/shared/types/model/photo';

const COLLECTION = 'profilePhotos';

export const MAX_PROFILE_PHOTOS = 6;

// Firestore composite index를 요구하지 않도록 where(userId)만 서버에서 필터하고
// status / order는 클라이언트에서 처리한다. 사진 수가 사용자당 작아서 비용 부담 없음.
export const getProfilePhotosByUserId = async (userId: string): Promise<ProfilePhoto[]> => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) =>
      toPlainTimestamps({ id: d.id, ...(d.data() as Omit<ProfilePhoto, 'id'>) })
    )
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
    // TODO(Phase 8): admin 검수 도입 시 'pending'으로 되돌리고 승인 워크플로 연결.
    // 현재는 ConsentStepPage AUTO_APPROVE와 동일한 임시 자동 승인 정책을 따른다.
    status: 'approved',
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

// 한 사진을 메인으로 지정하고 나머지 사용자 사진의 isMain을 false로 일괄 갱신.
// Firestore writeBatch 한 번에 처리하여 일관성 보장.
export const setMainProfilePhoto = async (userId: string, photoId: string): Promise<void> => {
  const photos = await getProfilePhotosByUserId(userId);
  const batch = writeBatch(db);
  photos.forEach((photo) => {
    const shouldBeMain = photo.id === photoId;
    if (photo.isMain !== shouldBeMain) {
      batch.update(doc(db, COLLECTION, photo.id), {
        isMain: shouldBeMain,
        updatedAt: serverTimestamp(),
      });
    }
  });
  await batch.commit();
};

// 사진 soft delete. Storage 파일은 별도 cleanup job 영역(Phase 11).
export const softDeleteProfilePhoto = async (photoId: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, photoId), {
    status: 'deleted',
    isMain: false,
    updatedAt: serverTimestamp(),
  });
};
