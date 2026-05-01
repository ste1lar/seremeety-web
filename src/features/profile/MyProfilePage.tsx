'use client';

import { useCallback, useContext, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  MypageDispatchContext,
  MypageStateContext,
  MypageStatusContext,
} from '@/features/profile/context/MypageContext';
import { MatchingDispatchContext } from '@/features/matching/context/MatchingContext';
import Loading from '@/shared/components/common/loading/Loading';
import PageTransition from '@/shared/components/common/PageTransition';
import Header from '@/shared/components/common/Header';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import MyProfileForm from '@/features/profile/components/my-profile/MyProfileForm';
import ProfilePhotosManager from '@/features/profile/components/photos/ProfilePhotosManager';
import { useAuthSession } from '@/shared/providers/AuthSessionProvider';
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
  const state = useContext(MypageStateContext);
  const { isFetching, isFetchError, isUpdating } = useContext(MypageStatusContext);
  const fetchUserProfiles = useContext(MatchingDispatchContext);
  const router = useRouter();
  const { onUpdate, onRefresh } = useContext(MypageDispatchContext);
  const { currentUser } = useAuthSession();
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
    if (!currentUser) {
      return;
    }
    const ensureProfile = async () => {
      const existing = await getProfileByUserId(currentUser.uid);
      if (existing) {
        setProfileId(existing.id);
      } else {
        const newId = await createDraftProfile(currentUser.uid);
        setProfileId(newId);
      }
    };
    void ensureProfile();
  }, [currentUser]);

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
      // 사진 변경 시 users/{uid}는 dual-write로 갱신되지만
      // MypageContext가 캐시한 state는 stale → 마이페이지로 돌아가도 96px 아바타가 안 갱신됨.
      // 명시적으로 다시 fetch 해서 동기화한다.
      void onRefresh();
    },
    [onRefresh]
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

  const executeSave = useCallback(
    async (nextFormData: UserProfile, isFirstSave: boolean) => {
      const result = await onUpdate({ ...nextFormData, profileStatus: 1 });

      if (!result.success) {
        openAlert('프로필 저장 실패', result.message ?? '오류가 발생했습니다');
        return;
      }

      if (isFirstSave) {
        await fetchUserProfiles();
      }

      openAlert('프로필 저장 성공', result.message ?? '성공적으로 저장되었습니다!', () => {
        router.push('/mypage');
      });
    },
    [fetchUserProfiles, onUpdate, openAlert, router]
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
          { label: '확인', onClick: () => void executeSave(nextFormData, true) },
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

    await executeSave(nextFormData, false);
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
            {currentUser && profileId && (
              <ProfilePhotosManager
                userId={currentUser.uid}
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
