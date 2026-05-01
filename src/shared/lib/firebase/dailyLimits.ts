import {
  Timestamp,
  collection,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { ReactionType } from '@/shared/types/model/reaction';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// 한국 사용자를 기준으로 daily 카운터의 경계를 KST 자정으로 잡는다.
// 클라이언트 timezone과 무관하게 항상 같은 경계를 반환.
export const getKstTodayStartMs = (): number => {
  const nowKstMs = Date.now() + KST_OFFSET_MS;
  const todayKstMidnightMs = Math.floor(nowKstMs / DAY_MS) * DAY_MS;
  return todayKstMidnightMs - KST_OFFSET_MS;
};

export const getKstTodayStartTimestamp = (): Timestamp =>
  Timestamp.fromMillis(getKstTodayStartMs());

// TODO(Phase 3): Functions로 이동. 클라이언트에서 count 쿼리는 비용/조작 가능.
const countReactionsTodayByType = async (
  fromUserId: string,
  type: ReactionType
): Promise<number> => {
  const q = query(
    collection(db, 'reactions'),
    where('fromUserId', '==', fromUserId),
    where('type', '==', type),
    where('createdAt', '>=', getKstTodayStartTimestamp())
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
};

export const countLikesToday = (fromUserId: string): Promise<number> =>
  countReactionsTodayByType(fromUserId, 'like');

export const countSuperLikesToday = (fromUserId: string): Promise<number> =>
  countReactionsTodayByType(fromUserId, 'superLike');

export const countRecommendationsShownToday = async (
  userId: string
): Promise<number> => {
  const q = query(
    collection(db, 'recommendationLogs'),
    where('userId', '==', userId),
    where('shownAt', '>=', getKstTodayStartTimestamp())
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
};
