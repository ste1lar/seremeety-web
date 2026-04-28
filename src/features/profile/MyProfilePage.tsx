'use client';

import { useCallback, useContext, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import {
  MypageDispatchContext,
  MypageStateContext,
  MypageStatusContext,
} from '@/features/profile/context/MypageContext';
import { MatchingDispatchContext } from '@/features/matching/context/MatchingContext';
import Loading from '@/shared/components/common/loading/Loading';
import PageTransition from '@/shared/components/common/PageTransition';
import Header from '@/shared/components/common/Header';
import CropperModal from '@/shared/components/common/cropper/CropperModal';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import MyProfileForm from '@/features/profile/components/my-profile/MyProfileForm';
import { myProfileForm } from '@/shared/lib/constants';
import { getAgeByBirthDate } from '@/shared/lib/format';
import { compressImage } from '@/shared/lib/media';
import { validationRules } from '@/shared/lib/validation';
import { cx } from '@/shared/lib/classNames';
import type { ProfileFieldId, UserProfile } from '@/shared/types/domain';
import styles from './MyProfilePage.module.scss';

const MyProfilePage = () => {
  const state = useContext(MypageStateContext);
  const { isFetching, isFetchError, isUpdating } = useContext(MypageStatusContext);
  const fetchUserProfiles = useContext(MatchingDispatchContext);
  const router = useRouter();
  const { onUpdate } = useContext(MypageDispatchContext);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [imgError, setImgError] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [openCropper, setOpenCropper] = useState(false);

  useEffect(() => {
    if (state) {
      setFormData(state);
    }
  }, [state]);

  useEffect(() => {
    setImgError(false);
  }, [formData?.profilePictureUrl]);

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

  const handleSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      setSelectedImage(URL.createObjectURL(compressedFile));
      setOpenCropper(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCropComplete = () => {
    if (!croppedImage) {
      return;
    }

    setFormData((prevState) =>
      prevState ? { ...prevState, profilePictureUrl: croppedImage } : prevState
    );
    setOpenCropper(false);
  };

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

    if (_.isEqual(state, nextFormData)) {
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
            {openCropper && (
              <CropperModal
                selectedImage={selectedImage ?? ''}
                setCroppedImage={setCroppedImage}
                setOpenCropper={setOpenCropper}
                handleCropComplete={handleCropComplete}
              />
            )}

            <figure className={styles['image-section']}>
              <label
                className={styles['image-label']}
                htmlFor="my-profile-image-upload"
              >
                <span className="sr-only">프로필 사진 변경</span>
                <Image
                  fill
                  priority
                  unoptimized
                  alt={`${formData.nickname} 프로필 사진`}
                  src={imgError ? sereMeetyLogo.src : formData.profilePictureUrl}
                  sizes="(max-width: 480px) calc(100vw - 3rem), 432px"
                  className={styles['profile-image']}
                  onError={() => setImgError(true)}
                />
              </label>
              <figcaption className="sr-only">현재 프로필 사진</figcaption>
            </figure>

            <input
              id="my-profile-image-upload"
              name="profilePicture"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSelectImage}
              tabIndex={-1}
            />

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
