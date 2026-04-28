import type { TimestampLike } from '@/shared/types/domain';

export type MessageStatus = 'sent' | 'deleted' | 'reported';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  status: MessageStatus;
  createdAt: TimestampLike;
  updatedAt?: TimestampLike;
  deletedAt?: TimestampLike;
}
