import type { TimestampLike } from '@/shared/types/domain';

export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export type AuthProvider = 'firebase_phone';

export type OnboardingStatus =
  | 'auth_only'
  | 'profile_required'
  | 'photo_required'
  | 'preference_required'
  | 'consent_required'
  | 'review_pending'
  | 'review_rejected'
  | 'approved';

export interface User {
  id: string;
  authProvider: AuthProvider;
  phoneAuthVerified: boolean;
  phoneNumberMasked?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  onboardingStatus: OnboardingStatus;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  lastLoginAt?: TimestampLike;
  deletedAt?: TimestampLike;
}
