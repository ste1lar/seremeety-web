import type { TimestampLike } from '@/shared/types/domain';

export type Gender = 'male' | 'female';

export type ProfileStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'deleted';

export type SmokingHabit = 'yes' | 'no' | 'occasionally';

export type DrinkingHabit = 'none' | 'occasionally' | 'socially' | 'often';

export type DatingIntent = 'serious' | 'casual' | 'friendship' | 'unsure';

export interface Profile {
  id: string;
  userId: string;
  nickname: string;
  birthYear: number;
  gender: Gender;
  location: string;
  height?: number;
  jobCategory?: string;
  educationLevel?: string;
  university?: string;
  mbti?: string;
  smoking?: SmokingHabit;
  drinking?: DrinkingHabit;
  religion?: string;
  datingIntent?: DatingIntent;
  bio: string;
  tags: string[];
  mainPhotoId?: string;
  status: ProfileStatus;
  rejectionReason?: string;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  submittedAt?: TimestampLike;
  reviewedAt?: TimestampLike;
  reviewedBy?: string;
}
