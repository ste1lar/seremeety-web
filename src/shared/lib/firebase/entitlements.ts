import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Entitlement, PlanId } from '@/shared/types/model/billing';

const COLLECTION = 'entitlements';

const FREE_PLAN_LIMITS = {
  dailyRecommendationLimit: 5,
  dailyLikeLimit: 3,
  dailySuperLikeLimit: 0,
  canUseAdvancedFilter: false,
  canSeeReceivedLikes: false,
} as const;

const PREMIUM_PLAN_LIMITS = {
  dailyRecommendationLimit: 15,
  dailyLikeLimit: 10,
  dailySuperLikeLimit: 3,
  canUseAdvancedFilter: true,
  canSeeReceivedLikes: true,
} as const;

const planLimits = (planId: PlanId) =>
  planId === 'premium' ? PREMIUM_PLAN_LIMITS : FREE_PLAN_LIMITS;

export const getEntitlementByUserId = async (userId: string): Promise<Entitlement | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, userId));
  if (!docSnap.exists()) {
    return null;
  }
  return docSnap.data() as Entitlement;
};

export const createDefaultEntitlement = async (userId: string): Promise<void> => {
  await setDoc(doc(db, COLLECTION, userId), {
    userId,
    planId: 'free',
    ...planLimits('free'),
    startsAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const setEntitlementPlan = async (userId: string, planId: PlanId): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, userId), {
    planId,
    ...planLimits(planId),
    updatedAt: serverTimestamp(),
  });
};
