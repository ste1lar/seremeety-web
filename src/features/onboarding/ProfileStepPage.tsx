'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/shared/lib/store/hooks';
import { selectAuthUid } from '@/shared/lib/store/authSlice';
import {
  createDraftProfile,
  getProfileByUserId,
  updateProfile,
} from '@/shared/lib/firebase/profiles';
import { setOnboardingStatus } from '@/shared/lib/firebase/usersV2';
import { writeProfileToLegacyUser } from '@/shared/lib/firebase/legacyBridge';
import { checkNicknameDuplicate } from '@/shared/lib/firebase/users';
import { placeList } from '@/shared/data/places';
import { universityList } from '@/shared/data/universities';
import Button from '@/shared/components/common/button/Button';
import Select, { type SelectOption } from '@/shared/components/common/select/Select';
import type { Gender } from '@/shared/types/model/profile';
import styles from './ProfileStepPage.module.scss';

const MBTI_OPTIONS = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 80;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 18;

interface ProfileFormState {
  nickname: string;
  birthYear: string;
  gender: Gender | '';
  location: string;
  bio: string;
  mbti: string;
  university: string;
}

const initialForm: ProfileFormState = {
  nickname: '',
  birthYear: '',
  gender: '',
  location: '',
  bio: '',
  mbti: '',
  university: '',
};

const flatLocationList = placeList.flatMap(([region]) => [region]);

const LOCATION_OPTIONS: SelectOption[] = flatLocationList.map((region) => ({
  value: region,
  label: region,
}));

const MBTI_SELECT_OPTIONS: SelectOption[] = MBTI_OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

const UNIVERSITY_OPTIONS: SelectOption[] = universityList.map((option) => ({
  value: option,
  label: option,
}));

const ProfileStepPage = () => {
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }
    const load = async () => {
      const existing = await getProfileByUserId(uid);
      if (existing) {
        setProfileId(existing.id);
        setForm({
          nickname: existing.nickname ?? '',
          birthYear: existing.birthYear ? String(existing.birthYear) : '',
          gender: existing.gender ?? '',
          location: existing.location ?? '',
          bio: existing.bio ?? '',
          mbti: existing.mbti ?? '',
          university: existing.university ?? '',
        });
      }
      setIsLoading(false);
    };
    void load();
  }, [uid]);

  const updateField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = async (): Promise<string | null> => {
    if (!form.nickname.trim()) return '닉네임을 입력해주세요';
    if (form.nickname.length < 2 || form.nickname.length > 12) {
      return '닉네임은 2~12자로 입력해주세요';
    }
    const isAvailable = await checkNicknameDuplicate(form.nickname);
    if (!isAvailable) return '이미 사용 중인 닉네임이에요';

    const birthYear = Number(form.birthYear);
    if (!birthYear || birthYear < MIN_BIRTH_YEAR || birthYear > MAX_BIRTH_YEAR) {
      return `출생연도는 ${MIN_BIRTH_YEAR}~${MAX_BIRTH_YEAR} 사이로 입력해주세요`;
    }
    if (form.gender !== 'male' && form.gender !== 'female') {
      return '성별을 선택해주세요';
    }
    if (!form.location.trim()) return '지역을 선택해주세요';
    if (!form.bio.trim() || form.bio.length < 10) {
      return '자기소개를 10자 이상 입력해주세요';
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!uid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const validationError = await validate();
      if (validationError) {
        setError(validationError);
        setIsSubmitting(false);
        return;
      }

      const profilePayload = {
        nickname: form.nickname.trim(),
        birthYear: Number(form.birthYear),
        gender: form.gender as Gender,
        location: form.location,
        bio: form.bio.trim(),
        mbti: form.mbti || undefined,
        university: form.university || undefined,
      };

      let pid = profileId;
      if (pid) {
        await updateProfile(pid, profilePayload);
      } else {
        pid = await createDraftProfile(uid, profilePayload);
        setProfileId(pid);
      }

      await writeProfileToLegacyUser(uid, {
        nickname: profilePayload.nickname,
        birthYear: profilePayload.birthYear,
        gender: profilePayload.gender,
        location: profilePayload.location,
        bio: profilePayload.bio,
        mbti: profilePayload.mbti,
        university: profilePayload.university,
      });

      await setOnboardingStatus(uid, 'photo_required');
      router.replace('/onboarding/photos');
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했어요.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.root}>
        <p className={styles.step}>STEP 2 / 6</p>
        <h1 className={styles.title}>기본 프로필 작성</h1>
        <p className={styles.description}>잠시만 기다려주세요...</p>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <p className={styles.step}>STEP 2 / 6</p>
      <h1 className={styles.title}>기본 프로필 작성</h1>
      <p className={styles.description}>
        상대에게 보여질 프로필이에요. 정확하게 작성해주세요.
      </p>

      <div className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>닉네임</span>
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => updateField('nickname', e.target.value)}
            maxLength={12}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>출생연도</span>
          <input
            type="number"
            value={form.birthYear}
            onChange={(e) => updateField('birthYear', e.target.value)}
            min={MIN_BIRTH_YEAR}
            max={MAX_BIRTH_YEAR}
            placeholder={`예: ${MAX_BIRTH_YEAR - 5}`}
            required
          />
        </label>

        <fieldset className={styles.field}>
          <legend className={styles.label}>성별</legend>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={form.gender === 'male'}
                onChange={() => updateField('gender', 'male')}
              />
              남성
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={form.gender === 'female'}
                onChange={() => updateField('gender', 'female')}
              />
              여성
            </label>
          </div>
        </fieldset>

        <div className={styles.field}>
          <span className={styles.label} id="onboarding-location-label">지역</span>
          <Select
            value={form.location}
            onChange={(next) => updateField('location', next)}
            options={LOCATION_OPTIONS}
            placeholder="선택"
            aria-labelledby="onboarding-location-label"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label} id="onboarding-mbti-label">MBTI (선택)</span>
          <Select
            value={form.mbti}
            onChange={(next) => updateField('mbti', next)}
            options={MBTI_SELECT_OPTIONS}
            placeholder="선택 안 함"
            isClearable
            aria-labelledby="onboarding-mbti-label"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label} id="onboarding-university-label">학교 (선택)</span>
          <Select
            value={form.university}
            onChange={(next) => updateField('university', next)}
            options={UNIVERSITY_OPTIONS}
            placeholder="선택 안 함"
            isClearable
            aria-labelledby="onboarding-university-label"
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>자기소개</span>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            rows={5}
            maxLength={500}
            required
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button
            text={isSubmitting ? '저장 중...' : '다음으로'}
            onClick={isSubmitting ? undefined : () => void handleSubmit()}
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileStepPage;
