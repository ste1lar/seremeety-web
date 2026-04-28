import type { TimestampLike } from '@/shared/types/domain';

export type PlanId = 'free' | 'premium';

export interface Entitlement {
  userId: string;
  planId: PlanId;
  dailyRecommendationLimit: number;
  dailyLikeLimit: number;
  dailySuperLikeLimit: number;
  canUseAdvancedFilter: boolean;
  canSeeReceivedLikes: boolean;
  startsAt: TimestampLike;
  expiresAt?: TimestampLike;
  updatedAt: TimestampLike;
}

export type PaymentStatus =
  | 'mock_pending'
  | 'mock_success'
  | 'mock_failed'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider = 'mock' | 'future_pg';

export interface Payment {
  id: string;
  userId: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  planId: PlanId;
  amount: number;
  currency: 'KRW';
  status: PaymentStatus;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}
