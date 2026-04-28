import type { OnboardingStatus } from '@/shared/types/model/user';

const allowedTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
  auth_only: ['profile_required'],
  profile_required: ['photo_required'],
  photo_required: ['preference_required'],
  preference_required: ['consent_required'],
  consent_required: ['review_pending'],
  review_pending: ['approved', 'review_rejected'],
  review_rejected: ['profile_required', 'photo_required'],
  approved: [],
};

export function canTransition(from: OnboardingStatus, to: OnboardingStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function nextOnboardingStatuses(from: OnboardingStatus): OnboardingStatus[] {
  return [...allowedTransitions[from]];
}

export function isApproved(status: OnboardingStatus): boolean {
  return status === 'approved';
}

export function isUnderReview(status: OnboardingStatus): boolean {
  return status === 'review_pending';
}

export function isOnboardingIncomplete(status: OnboardingStatus): boolean {
  return status !== 'approved';
}
