import type { Profile } from '@/shared/types/model/profile';
import type { ProfilePhoto } from '@/shared/types/model/photo';

interface ProfileCompletenessInput {
  profile: Profile | null;
  photos: ProfilePhoto[];
}

interface ProfileCompletenessResult {
  score: number; // 0-100
  missing: string[];
  hasMainPhoto: boolean;
  additionalPhotoCount: number;
}

const FIELD_WEIGHT = {
  nickname: 10,
  birthYear: 10,
  location: 10,
  bio: 10,
  mbti: 5,
  university: 5,
} as const;

const MAIN_PHOTO_WEIGHT = 30;
const ADDITIONAL_PHOTO_PER_PHOTO = 5;
const MAX_ADDITIONAL_PHOTO_BONUS = 20;
const MIN_BIO_LENGTH = 30;

export function calculateProfileCompleteness({
  profile,
  photos,
}: ProfileCompletenessInput): ProfileCompletenessResult {
  let score = 0;
  const missing: string[] = [];

  if (profile?.nickname?.trim()) {
    score += FIELD_WEIGHT.nickname;
  } else {
    missing.push('닉네임');
  }

  if (profile?.birthYear && profile.birthYear > 0) {
    score += FIELD_WEIGHT.birthYear;
  } else {
    missing.push('출생연도');
  }

  if (profile?.location?.trim()) {
    score += FIELD_WEIGHT.location;
  } else {
    missing.push('지역');
  }

  if (profile?.bio && profile.bio.trim().length >= MIN_BIO_LENGTH) {
    score += FIELD_WEIGHT.bio;
  } else {
    missing.push(`자기소개 ${MIN_BIO_LENGTH}자 이상`);
  }

  if (profile?.mbti) {
    score += FIELD_WEIGHT.mbti;
  }
  if (profile?.university) {
    score += FIELD_WEIGHT.university;
  }

  const visiblePhotos = photos.filter((p) => p.status !== 'deleted');
  const hasMainPhoto = visiblePhotos.some((p) => p.isMain);
  const additionalPhotoCount = visiblePhotos.filter((p) => !p.isMain).length;

  if (hasMainPhoto) {
    score += MAIN_PHOTO_WEIGHT;
  } else {
    missing.push('대표 사진');
  }

  score += Math.min(
    additionalPhotoCount * ADDITIONAL_PHOTO_PER_PHOTO,
    MAX_ADDITIONAL_PHOTO_BONUS
  );

  return {
    score: Math.min(score, 100),
    missing,
    hasMainPhoto,
    additionalPhotoCount,
  };
}
