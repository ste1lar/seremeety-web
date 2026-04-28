import type { TimestampLike } from '@/shared/types/domain';
import type { DatingIntent, Gender } from './profile';

export interface Preference {
  id: string;
  userId: string;
  targetGender: Gender;
  minAge: number;
  maxAge: number;
  preferredLocations: string[];
  minHeight?: number;
  maxHeight?: number;
  preferredDatingIntent?: DatingIntent[];
  preferredTags?: string[];
  dealBreakers?: string[];
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}
