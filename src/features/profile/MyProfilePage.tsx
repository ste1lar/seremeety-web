'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetMeQuery,
  useUpdateMeMutation,
} from '@/shared/lib/api/profileApi';
import { baseApi } from '@/shared/lib/api/baseApi';
import { useAppDispatch } from '@/shared/lib/store/hooks';
import Loading from '@/shared/components/common/loading/Loading';
import PageTransition from '@/shared/components/common/PageTransition';
import Header from '@/shared/components/common/Header';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import MyProfileForm from '@/features/profile/components/my-profile/MyProfileForm';
import ProfilePhotosManager from '@/features/profile/components/photos/ProfilePhotosManager';
import { useAppSelector } from '@/shared/lib/store/hooks';
import { selectAuthUid } from '@/shared/lib/store/authSlice';
import { createDraftProfile, getProfileByUserId } from '@/shared/lib/firebase/profiles';
import { myProfileForm } from '@/shared/lib/constants';
import { getAgeByBirthDate } from '@/shared/lib/format';
import { validationRules } from '@/shared/lib/validation';
import { cx } from '@/shared/lib/classNames';
import type { ProfilePhoto } from '@/shared/types/model/photo';
import type { ProfileFieldId, UserProfile } from '@/shared/types/domain';
import styles from './MyProfilePage.module.scss';

const PROFILE_FORM_KEYS: (keyof UserProfile)[] = [
  'nickname',
  'birthdate',
  'age',
  'gender',
  'mbti',
  'university',
  'place',
  'introduce',
];

const isProfileFormUnchanged = (a: UserProfile, b: UserProfile): boolean =>
  PROFILE_FORM_KEYS.every((key) => a[key] === b[key]);

const MyProfilePage = () => {
  const {
    data: state,
    isLoading: isFetching,
    isError: isFetchError,
    refetch,
  } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const uid = useAppSelector(selectAuthUid);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  useEffect(() => {
    if (state) {
      setFormData(state);
    }
  }, [state]);

  // Phase 4: profilePhotos 컬렉션 사용을 위해 신규 Profile 문서 보장.
  // grandfather 사용자(old shape만 있고 신규 profile 없음)도 마이페이지 진입 시 자동 생성.
  useEffect(() => {
    if (!uid) {
      return;
    }
    const ensureProfile = async () => {
      const existing = await getProfileByUserId(uid);
      if (existing) {
        setProfileId(existing.id);
      } else {
        const newId = await createDraftProfile(uid);
        setProfileId(newId);
      }
    };
    void ensureProfile();
  }, [uid]);

  const handleFormDataChange = useCallback((id: ProfileFieldId, data: string) => {
    setFormData((prevState) => {
      if (!prevState) {
        return prevState;
      }

      const updatedData = { ...prevState, [id]: data };
      if (id === 'birthdate') {
        updatedData.age = data ? `${getAgeByBirthDate(data)}세` : '';
      }

      return updatedData;
    });
  }, []);

  const handlePhotosChange = useCallback(
    (photos: ProfilePhoto[]) => {
      const main = photos.find((p) => p.isMain);
      setFormData((prev) => {
        if (!prev) return prev;
        return { ...prev, profilePictureUrl: main?.displayUrl ?? '' };
      });
      // ProfilePhotosManager는 RTK Query 외부에서 firebase에 직접 write한다.
      // - users/{uid}.profilePictureUrl dual-write → Me 캐시 stale → refetch
      // - profilePhotos 컬렉션 → MyProfilePreview의 Photo 캐시 stale → invalidate
      void refetch();
      if (uid) {
        dispatch(baseApi.util.invalidateTags([{ type: 'Photo', id: uid }]));
      }
    },
    [uid, dispatch, refetch]
  );

  const openAlert = useCallback((title: string, description: string, onConfirm?: () => void) => {
    setModal({
      actions: [{ label: '확인', onClick: onConfirm }],
      closeOnBackdrop: false,
      description,
      showCloseButton: false,
      title,
    });
  }, []);

  // updateMe mutation이 'Recommendation' 태그도 무효화하므로
  // 첫 저장 후 별도 fetchUserProfiles 호출은 필요 없다. /matching 진입 시 자동 재페치.
  const executeSave = useCallback(
    async (nextFormData: UserProfile) => {
      try {
        await updateMe({ ...nextFormData, profileStatus: 1 }).unwrap();
      } catch {
        openAlert('프로필 저장 실패', '오류가 발생했습니다');
        return;
      }

      openAlert('프로필 저장 성공', '성공적으로 저장되었습니다!', () => {
        router.push('/mypage');
      });
    },
    [openAlert, router, updateMe]
  );

  const onSave = async (nextFormData: UserProfile) => {
    if (!state) {
      return;
    }

    if (isProfileFormUnchanged(state, nextFormData)) {
      openAlert('프로필 저장', '프로필 수정 사항이 없어요');
      return;
    }

    for (const field in nextFormData) {
      const key = field as keyof UserProfile;
      const validation = validationRules[key];
      if (validation) {
        const result = await validation(String(nextFormData[key] ?? ''));
        if (result !== true) {
          openAlert('프로필 저장 실패', result);
          return;
        }
      }
    }

    const isFirstSave = state.profileStatus !== 1;
    if (isFirstSave) {
      setModal({
        actions: [
          { label: '취소', tone: 'secondary' },
          { label: '확인', onClick: () => void executeSave(nextFormData) },
        ],
        closeOnBackdrop: true,
        showCloseButton: true,
        title: '프로필 저장',
        children: (
          <>
            <p>나이, 성별은 이후에 수정이 어렵습니다.</p>
            <p>정말 저장할까요?</p>
          </>
        ),
      });
      return;
    }

    await executeSave(nextFormData);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData) {
      return;
    }

    void onSave(formData);
  };

  const modalElement = (
    <Modal
      open={modal !== null}
      title={modal?.title ?? ''}
      description={modal?.description}
      actions={modal?.actions}
      closeOnBackdrop={modal?.closeOnBackdrop}
      showCloseButton={modal?.showCloseButton}
      onClose={() => setModal(null)}
    >
      {modal?.children}
    </Modal>
  );

  return (
    <PageTransition>
      <section className={styles.root} aria-labelledby="my-profile-title">
        <Header
          variant="my-profile"
          title="MY PROFILE"
          titleId="my-profile-title"
          headingLevel="h1"
          showBackButton
          menuAriaLabel="프로필 편집 메뉴"
          menu={
            <>
              <button
                type="submit"
                form="my-profile-form"
                disabled={isFetching || isUpdating || !formData}
              >
                {isUpdating ? '저장 중' : '저장'}
              </button>
            </>
          }
        />

        {isFetchError ? (
          <div className={cx(styles.content, styles['content--loading'])}>
            <p className={styles.error}>프로필 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
          </div>
        ) : isFetching || !state || !formData ? (
          <div className={cx(styles.content, styles['content--loading'])}>
            <Loading className={styles.loading} />
          </div>
        ) : (
          <form className={styles.content} id="my-profile-form" onSubmit={handleSubmit}>
            {uid && profileId && (
              <ProfilePhotosManager
                userId={uid}
                profileId={profileId}
                onChange={handlePhotosChange}
              />
            )}

            {myProfileForm.map((fieldConfig) => (
              <MyProfileForm
                key={fieldConfig.id}
                {...fieldConfig}
                data={formData[fieldConfig.id]}
                onChange={handleFormDataChange}
                isDisabled={formData.profileStatus === 1}
              />
            ))}
          </form>
        )}
      </section>
      {modalElement}
    </PageTransition>
  );
};

export default MyProfilePage;
