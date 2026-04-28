import type { TimestampLike } from '@/shared/types/domain';

export interface Consent {
  id: string;
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  marketingAgreed: boolean;
  agreedAt: TimestampLike;
  createdAt: TimestampLike;
}
