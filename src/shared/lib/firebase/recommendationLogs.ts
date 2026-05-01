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
import type { ReactionType } from '@/shared/types/model/reaction';
import type { RecommendationLog } from '@/shared/types/model/recommendation';

const COLLECTION = 'recommendationLogs';

// userId(추천 받은 사람) + recommendedUserId 조합을 deterministic doc id로
// 사용해 같은 페어 중복 노출을 방지하고 composite index를 회피한다.
const logId = (userId: string, recommendedUserId: string): string =>
  `${userId}_${recommendedUserId}`;

export const createRecommendationLog = async (
  userId: string,
  recommendedUserId: string,
  score: number,
  reasonCodes: string[]
): Promise<string> => {
  const id = logId(userId, recommendedUserId);
  await setDoc(doc(db, COLLECTION, id), {
    userId,
    recommendedUserId,
    score,
    reasonCodes,
    shownAt: serverTimestamp(),
  });
  return id;
};

// userId 기준 모든 노출 로그. 호출 측에서 all-time / today 셋을 파생한다.
export const getRecommendationLogsByUser = async (
  userId: string
): Promise<RecommendationLog[]> => {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<RecommendationLog, 'id'>),
  }));
};

// reaction 발생 시 해당 추천 로그에 결과를 기록.
// 추천을 거치지 않고 직접 react한 경우엔 로그가 없을 수 있어 silent fail.
export const markRecommendationReacted = async (
  userId: string,
  recommendedUserId: string,
  reactionType: ReactionType
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTION, logId(userId, recommendedUserId)), {
      reactedAt: serverTimestamp(),
      reactionType,
    });
  } catch (error) {
    // 로그가 없는 페어는 무시 (추천 안 거치고 반응한 케이스).
    if (process.env.NODE_ENV !== 'production') {
      console.debug('markRecommendationReacted: log not found', error);
    }
  }
};
