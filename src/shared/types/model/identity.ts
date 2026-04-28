import type { TimestampLike } from '@/shared/types/domain';
import type { Gender } from './profile';

export type IdentityVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'failed'
  | 'expired';

export type IdentityVerificationProvider =
  | 'none'
  | 'nice'
  | 'kmc'
  | 'pass'
  | 'future_provider';

// Korean real-name verification (NICE/KMC/PASS) is NOT integrated in Phase 2.
// This document captures only mock/status state. CI/DI/실명/생년월일 등은 실운영
// 정책 + 법무 검토 전까지 무분별하게 저장하지 않는다 (ROADMAP §3.7).
export interface IdentityVerification {
  id: string;
  userId: string;
  provider: IdentityVerificationProvider;
  status: IdentityVerificationStatus;
  verifiedAt?: TimestampLike;
  ciHash?: string;
  diHash?: string;
  birthYear?: number;
  gender?: Gender;
  ageVerified?: boolean;
  adultVerified?: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}
