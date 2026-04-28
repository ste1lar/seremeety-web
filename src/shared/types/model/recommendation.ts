import type { TimestampLike } from '@/shared/types/domain';
import type { ReactionType } from './reaction';

export interface RecommendationLog {
  id: string;
  userId: string;
  recommendedUserId: string;
  score: number;
  reasonCodes: string[];
  shownAt: TimestampLike;
  reactedAt?: TimestampLike;
  reactionType?: ReactionType;
}
