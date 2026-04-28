import type { TimestampLike } from '@/shared/types/domain';

export type PhotoStatus = 'uploading' | 'pending' | 'approved' | 'rejected' | 'deleted';

export interface ProfilePhoto {
  id: string;
  userId: string;
  profileId: string;
  storagePath: string;
  originalUrl?: string;
  displayUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  order: number;
  isMain: boolean;
  status: PhotoStatus;
  rejectionReason?: string;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  reviewedAt?: TimestampLike;
  reviewedBy?: string;
}
