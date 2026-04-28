import type { TimestampLike } from '@/shared/types/domain';

export interface Block {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  reason?: string;
  createdAt: TimestampLike;
}

export type ReportTargetType = 'profile' | 'photo' | 'message' | 'user';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterUserId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetUserId?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  reviewedAt?: TimestampLike;
  reviewedBy?: string;
  resolutionNote?: string;
}
