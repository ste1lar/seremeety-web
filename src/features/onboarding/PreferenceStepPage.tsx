'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/shared/lib/store/hooks';
import { selectAuthUid } from '@/shared/lib/store/authSlice';
import {
  createPreference,
  getPreferenceByUserId,
  updatePreference,
} from '@/shared/lib/firebase/preferences';
import { setOnboardingStatus } from '@/shared/lib/firebase/usersV2';
import { placeList } from '@/shared/data/places';
import Button from '@/shared/components/common/button/Button';
import type { Gender } from '@/shared/types/model/profile';
import styles from './PreferenceStepPage.module.scss';

const flatLocationList = placeList.flatMap(([region]) => [region]);

const MIN_AGE_LIMIT = 18;
const MAX_AGE_LIMIT = 80;

interface PreferenceFormState {
  targetGender: Gender;
  minAge: string;
  maxAge: string;
  preferredLocations: string[];
}

const initialForm: PreferenceFormState = {
  targetGender: 'female',
  minAge: '20',
  maxAge: '35',
  preferredLocations: [],
};

const PreferenceStepPage = () => {
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const [form, setForm] = useState<PreferenceFormState>(initialForm);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }
    const load = async () => {
      const existing = await getPreferenceByUserId(uid);
      if (existing) {
        setPreferenceId(existing.id);
        setForm({
          targetGender: existing.targetGender,
          minAge: String(existing.minAge),
          maxAge: String(existing.maxAge),
          preferredLocations: existing.preferredLocations,
        });
      }
      setIsLoading(false);
    };
    void load();
  }, [uid]);

  const toggleLocation = (location: string) => {
    setForm((prev) => {
      const next = prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter((l) => l !== location)
        : [...prev.preferredLocations, location];
      return { ...prev, preferredLocations: next };
    });
  };

  const validate = (): string | null => {
    const min = Number(form.minAge);
    const max = Number(form.maxAge);
    if (!min || min < MIN_AGE_LIMIT || min > MAX_AGE_LIMIT) {
      return `최소 나이는 ${MIN_AGE_LIMIT}~${MAX_AGE_LIMIT} 사이로 입력해주세요`;
    }
    if (!max || max < MIN_AGE_LIMIT || max > MAX_AGE_LIMIT) {
      return `최대 나이는 ${MIN_AGE_LIMIT}~${MAX_AGE_LIMIT} 사이로 입력해주세요`;
    }
    if (min > max) return '최소 나이가 최대 나이보다 클 수 없어요';
    return null;
  };

  const handleSubmit = async () => {
    if (!uid) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        setIsSubmitting(false);
        return;
      }

      const payload = {
        targetGender: form.targetGender,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        preferredLocations: form.preferredLocations,
      };

      if (preferenceId) {
        await updatePreference(preferenceId, payload);
      } else {
        await createPreference(uid, payload);
      }

      await setOnboardingStatus(uid, 'consent_required');
      router.replace('/onboarding/consent');
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했어요.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.root}>
        <p className={styles.step}>STEP 4 / 6</p>
        <h1 className={styles.title}>매칭 선호 조건</h1>
        <p className={styles.description}>잠시만 기다려주세요...</p>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <p className={styles.step}>STEP 4 / 6</p>
      <h1 className={styles.title}>매칭 선호 조건</h1>
      <p className={styles.description}>
        상대에게는 보이지 않아요. 매칭에만 사용됩니다.
      </p>

      <fieldset className={styles.field}>
        <legend className={styles.label}>관심 성별</legend>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="targetGender"
              checked={form.targetGender === 'female'}
              onChange={() => setForm((prev) => ({ ...prev, targetGender: 'female' }))}
            />
            여성
          </label>
          <label>
            <input
              type="radio"
              name="targetGender"
              checked={form.targetGender === 'male'}
              onChange={() => setForm((prev) => ({ ...prev, targetGender: 'male' }))}
            />
            남성
          </label>
        </div>
      </fieldset>

      <div className={styles.ageRow}>
        <label className={styles.field}>
          <span className={styles.label}>최소 나이</span>
          <input
            type="number"
            value={form.minAge}
            onChange={(e) => setForm((prev) => ({ ...prev, minAge: e.target.value }))}
            min={MIN_AGE_LIMIT}
            max={MAX_AGE_LIMIT}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>최대 나이</span>
          <input
            type="number"
            value={form.maxAge}
            onChange={(e) => setForm((prev) => ({ ...prev, maxAge: e.target.value }))}
            min={MIN_AGE_LIMIT}
            max={MAX_AGE_LIMIT}
          />
        </label>
      </div>

      <fieldset className={styles.field}>
        <legend className={styles.label}>선호 지역 (다중 선택, 미선택 시 전체)</legend>
        <div className={styles.locationGrid}>
          {flatLocationList.map((p) => (
            <label key={p} className={styles.locationItem}>
              <input
                type="checkbox"
                checked={form.preferredLocations.includes(p)}
                onChange={() => toggleLocation(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>

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
    </section>
  );
};

export default PreferenceStepPage;
