import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { emptyUserProfile } from '@/shared/lib/constants';
import { normalizeUserProfile } from '@/shared/lib/firebase/normalizers';
import type { UserProfile } from '@/shared/types/domain';

export const checkNicknameDuplicate = async (value: string): Promise<boolean> => {
  const userSnapshot = await getDocs(collection(db, 'users'));
  const currentUid = auth.currentUser?.uid;

  for (const userDoc of userSnapshot.docs) {
    const uid = userDoc.id;
    const userData = normalizeUserProfile(userDoc.data(), uid);

    if (uid !== currentUid && value === userData.nickname) {
      return false;
    }
  }

  return true;
};

export const getUserDataByUid = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return normalizeUserProfile(docSnap.data(), docSnap.id);
};

export const setNewUserData = async (user: User): Promise<void> => {
  const usersRef = collection(db, 'users');

  await setDoc(doc(usersRef, user.uid), {
    ...emptyUserProfile,
    createdAt: serverTimestamp(),
    phone: user.phoneNumber ?? '',
  });
};

export const updateUserDataByUid = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const usersRef = collection(db, 'users');
  const payload: Partial<UserProfile> = { ...data };
  delete payload.uid;
  await updateDoc(doc(usersRef, uid), payload);
};

export const getUserProfiles = async (currentUserData: UserProfile): Promise<UserProfile[]> => {
  const queryConstraints: QueryConstraint[] = [where('profileStatus', '==', 1)];

  if (currentUserData.gender) {
    queryConstraints.push(
      where('gender', '==', currentUserData.gender === 'male' ? 'female' : 'male')
    );
  }

  const querySnapshot = await getDocs(query(collection(db, 'users'), ...queryConstraints));

  return querySnapshot.docs.map((userDoc) => normalizeUserProfile(userDoc.data(), userDoc.id));
};
