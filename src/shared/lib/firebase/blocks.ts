import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Block } from '@/shared/types/model/safety';

const COLLECTION = 'blocks';

// blockerUserId_blockedUserId 결정적 doc id로 중복 차단 방지.
const blockId = (blockerUserId: string, blockedUserId: string): string =>
  `${blockerUserId}_${blockedUserId}`;

export const createBlock = async (
  blockerUserId: string,
  blockedUserId: string,
  reason?: string
): Promise<string> => {
  const id = blockId(blockerUserId, blockedUserId);
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    blockerUserId,
    blockedUserId,
    ...(reason ? { reason } : {}),
    createdAt: serverTimestamp(),
  });
  return id;
};

// 내가 차단한 사용자 set (추천 후보에서 제외).
export const getBlockedUserIds = async (
  blockerUserId: string
): Promise<Set<string>> => {
  const q = query(
    collection(db, COLLECTION),
    where('blockerUserId', '==', blockerUserId)
  );
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => (d.data() as Block).blockedUserId));
};

// 나를 차단한 사용자 set (대칭 제외 — 차단당한 입장에서도 보이지 않게).
export const getBlockerUserIds = async (
  blockedUserId: string
): Promise<Set<string>> => {
  const q = query(
    collection(db, COLLECTION),
    where('blockedUserId', '==', blockedUserId)
  );
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => (d.data() as Block).blockerUserId));
};

export const isBlockedBetween = async (
  userA: string,
  userB: string
): Promise<boolean> => {
  const [aBlockedB, bBlockedA] = await Promise.all([
    getDocs(query(
      collection(db, COLLECTION),
      where('blockerUserId', '==', userA),
      where('blockedUserId', '==', userB)
    )),
    getDocs(query(
      collection(db, COLLECTION),
      where('blockerUserId', '==', userB),
      where('blockedUserId', '==', userA)
    )),
  ]);
  return !aBlockedB.empty || !bBlockedA.empty;
};
