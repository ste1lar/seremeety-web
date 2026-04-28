import type { TimestampLike } from '@/shared/types/domain';

export type ReactionType = 'like' | 'pass' | 'superLike';

export interface Reaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: ReactionType;
  createdAt: TimestampLike;
}
