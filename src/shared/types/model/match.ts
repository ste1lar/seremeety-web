import type { TimestampLike } from '@/shared/types/domain';

export type MatchStatus = 'active' | 'unmatched' | 'blocked' | 'deleted';

export interface Match {
  id: string;
  userIds: [string, string];
  createdByReactionIds: string[];
  status: MatchStatus;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  unmatchedAt?: TimestampLike;
  blockedAt?: TimestampLike;
}
