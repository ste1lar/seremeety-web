import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Match } from '@/shared/types/model/match';

const COLLECTION = 'matches';

// 두 유저의 페어를 정렬하여 deterministic key로 doc id를 만든다.
// 동일 페어에 대해 createMatch가 idempotent하도록 보장.
const matchKey = (userA: string, userB: string): string =>
  [userA, userB].sort().join('_');

// TODO(Phase 3): mutual like 검증과 함께 Functions로 이동.
// 현재는 reaction → mutual check → createMatch를 클라이언트에서 처리한다.
export const createMatch = async (
  userA: string,
  userB: string,
  reactionIds: string[]
): Promise<string> => {
  const id = matchKey(userA, userB);
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    userIds: [userA, userB].sort(),
    createdByReactionIds: reactionIds,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
};

export const getActiveMatchByUsers = async (
  userA: string,
  userB: string
): Promise<Match | null> => {
  const ref = doc(db, COLLECTION, matchKey(userA, userB));
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  const match = { id: snap.id, ...(snap.data() as Omit<Match, 'id'>) };
  return match.status === 'active' ? match : null;
};

// userIds array-contains + status 복합 인덱스를 피하기 위해 status는 클라이언트에서 필터.
export const getMatchesByUserId = async (userId: string): Promise<Match[]> => {
  const q = query(
    collection(db, COLLECTION),
    where('userIds', 'array-contains', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }))
    .filter((m) => m.status === 'active');
};
